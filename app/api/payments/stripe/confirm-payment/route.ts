import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPlanInstructorEmail } from '@/lib/emailService';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY no está configurado' },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    const {
      paymentIntentId,
      type,
      items,
      planId,
      shippingInfo,
      checkoutSessionId,
    } = await request.json();
    const parsedUserId = session?.user?.id ? parseInt(session.user.id, 10) : null;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'El pago no se completó correctamente' },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findFirst({
      where: { paymentId: paymentIntentId },
    });

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
        message: '¡Pago exitoso! Tu pedido ha sido confirmado.',
      });
    }

    if (type === 'cart') {
      let resolvedItems = items;
      let resolvedShippingInfo = shippingInfo;

      if (
        (!Array.isArray(resolvedItems) || resolvedItems.length === 0) &&
        checkoutSessionId
      ) {
        const checkoutSession = await prisma.checkoutSession.findUnique({
          where: { id: checkoutSessionId },
        });

        if (!checkoutSession || checkoutSession.expiresAt < new Date()) {
          return NextResponse.json(
            { error: 'La sesión de checkout expiró. Intenta de nuevo.' },
            { status: 400 }
          );
        }

        resolvedItems = checkoutSession.items || [];
        resolvedShippingInfo = checkoutSession.shippingInfo || null;
      }

      const stockItems = Array.isArray(resolvedItems) ? resolvedItems : [];

      try {
        const order = await prisma.$transaction(async (tx) => {
          for (const item of stockItems) {
            const productId = item.productId ?? item.id;
            const quantity = Number(item.quantity || 0);

            if (!productId || quantity <= 0) continue;

            const updated = await tx.item.updateMany({
              where: {
                id: Number(productId),
                stock: { gte: quantity },
              },
              data: {
                stock: { decrement: quantity },
              },
            });

            if (updated.count === 0) {
              const err = new Error('STOCK_INSUFFICIENT');
              (err as any).productId = Number(productId);
              (err as any).quantity = quantity;
              throw err;
            }
          }

          const createdOrder = await tx.order.create({
            data: {
              userId: Number.isFinite(parsedUserId) ? parsedUserId : null,
              customerFirstName: resolvedShippingInfo?.firstName || null,
              customerLastName: resolvedShippingInfo?.lastName || null,
              totalAmount: paymentIntent.amount / 100,
              status: 'COMPLETED',
              paymentMethod: 'STRIPE',
              paymentId: paymentIntentId,
              shippingAddress: resolvedShippingInfo?.address || '',
              shippingCity: resolvedShippingInfo?.city || '',
              shippingState: resolvedShippingInfo?.state || '',
              shippingPostalCode: resolvedShippingInfo?.postalCode || '',
              customerEmail:
                resolvedShippingInfo?.email || paymentIntent.receipt_email || '',
              customerPhone: resolvedShippingInfo?.phone || '',
              items: resolvedItems,
            },
          });

          if (checkoutSessionId) {
            await tx.checkoutSession.update({
              where: { id: checkoutSessionId },
              data: { status: 'COMPLETED' },
            });
          }

          return createdOrder;
        });

        return NextResponse.json({
          success: true,
          orderId: order.id,
          message: '¡Pago exitoso! Tu pedido ha sido confirmado.',
        });
      } catch (error: any) {
        if (error?.message === 'STOCK_INSUFFICIENT') {
          const productId = Number(error.productId);
          const quantity = Number(error.quantity || 0);
          const itemRecord = Number.isFinite(productId)
            ? await prisma.item.findUnique({
                where: { id: productId },
                select: { stock: true },
              })
            : null;

          await prisma.stockAlert.create({
            data: {
              productId: Number.isFinite(productId) ? productId : null,
              requestedQuantity: quantity || 0,
              availableStock: itemRecord?.stock ?? null,
              paymentProvider: 'STRIPE',
              paymentId: paymentIntentId,
              context: 'stripe-confirm',
            },
          });

          await prisma.retryEvent.create({
            data: {
              paymentProvider: 'STRIPE',
              paymentId: paymentIntentId,
              reason: 'STOCK_INSUFFICIENT',
              context: Number.isFinite(productId)
                ? `productId:${productId}`
                : null,
            },
          });

          return NextResponse.json(
            { error: 'Stock insuficiente para uno o más productos' },
            { status: 409 }
          );
        }

        throw error;
      }
    }

    if (type === 'plan' && planId) {
      if (!session?.user?.id || !Number.isFinite(parsedUserId)) {
        return NextResponse.json(
          { error: 'Debes iniciar sesión para suscribirte' },
          { status: 401 }
        );
      }

      const plan = await prisma.plan.findUnique({
        where: { id: parseInt(planId, 10) },
      });

      if (!plan) {
        return NextResponse.json(
          { error: 'Plan no encontrado' },
          { status: 404 }
        );
      }

      const order = await prisma.order.create({
        data: {
          userId: parsedUserId!,
          totalAmount: paymentIntent.amount / 100,
          status: 'COMPLETED',
          paymentMethod: 'STRIPE',
          paymentId: paymentIntentId,
          planId: parseInt(planId, 10),
          customerEmail: session.user.email || '',
          items: [
            {
              type: 'plan',
              planId: plan.id,
              title: plan.title,
              price: plan.price,
              currency: plan.currency,
            },
          ],
        },
      });

      const userProfile = await prisma.user.findUnique({
        where: { id: parsedUserId! },
        select: {
          name: true,
          email: true,
          fitnessProfileData: true,
          weightKg: true,
          heightCm: true,
          age: true,
          trainingTime: true,
          goal: true,
          equipmentAvailability: true,
          healthCondition: true,
        },
      });

      const fallbackProfileData = userProfile
        ? {
            weightKg: userProfile.weightKg ?? null,
            heightCm: userProfile.heightCm ?? null,
            age: userProfile.age ?? null,
            trainingTime: userProfile.trainingTime ?? null,
            goal: userProfile.goal ?? null,
            equipmentAvailability: userProfile.equipmentAvailability ?? null,
            healthCondition: userProfile.healthCondition ?? null,
          }
        : null;

      await sendPlanInstructorEmail({
        userName: userProfile?.name ?? null,
        userEmail: userProfile?.email ?? session.user.email ?? null,
        planTitle: plan.title,
        fitnessProfileData: (userProfile?.fitnessProfileData as Record<string, unknown> | null) ?? fallbackProfileData,
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        message: '¡Suscripción exitosa! Ya tienes acceso a tu plan.',
      });
    }

    return NextResponse.json(
      { error: 'Tipo de orden inválido' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: error.message || 'Error al confirmar el pago' },
      { status: 500 }
    );
  }
}

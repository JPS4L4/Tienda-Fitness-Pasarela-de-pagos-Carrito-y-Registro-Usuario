import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';
import { sendPlanInstructorEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  let paymentId: number | string | undefined;
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'MERCADOPAGO_ACCESS_TOKEN no está configurado' },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
    });

    const body = await request.json();

    const eventType = body?.type || body?.topic || body?.action;
    const isPaymentEvent =
      eventType === 'payment' ||
      (typeof eventType === 'string' && eventType.startsWith('payment'));

    // MercadoPago envía notificaciones de tipo 'payment'
    if (isPaymentEvent) {
      const rawResource = typeof body?.resource === 'string'
        ? body.resource.split('/').pop()
        : undefined;
      paymentId = body?.data?.id || body?.id || rawResource;

      if (!paymentId) {
        return NextResponse.json(
          { error: 'No se recibió paymentId en el webhook' },
          { status: 400 }
        );
      }

      // Obtener detalles del pago
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      // Verificar que el pago fue aprobado
      if (paymentData.status === 'approved') {
        const existingOrder = await prisma.order.findFirst({
          where: { paymentId: paymentId.toString() },
        });

        if (existingOrder) {
          return NextResponse.json({ received: true });
        }

        const metadata = paymentData.metadata as any;
        const type = metadata.type;
        const userIdRaw = metadata.user_id !== 'guest' ? metadata.user_id : null;
        const userId = userIdRaw ? parseInt(userIdRaw, 10) : null;

        if (type === 'cart') {
          // Crear orden de carrito
          let items = metadata.items ? JSON.parse(metadata.items) : [];
          let shippingInfo = metadata.shipping_info
            ? JSON.parse(metadata.shipping_info)
            : null;

          if ((!items || items.length === 0) && metadata.checkout_id) {
            const checkoutSession = await prisma.checkoutSession.findUnique({
              where: { id: metadata.checkout_id },
            });

            if (checkoutSession && checkoutSession.expiresAt >= new Date()) {
              items = checkoutSession.items || [];
              shippingInfo = checkoutSession.shippingInfo || null;
              await prisma.checkoutSession.update({
                where: { id: checkoutSession.id },
                data: { status: 'COMPLETED' },
              });
            }
          }

          const stockItems = Array.isArray(items) ? items : [];

          await prisma.$transaction(async (tx) => {
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

            await tx.order.create({
              data: {
                userId,
                customerFirstName: shippingInfo?.firstName || null,
                customerLastName: shippingInfo?.lastName || null,
                totalAmount: paymentData.transaction_amount!,
                status: 'COMPLETED',
                paymentMethod: 'MERCADOPAGO',
                paymentId: paymentId ? paymentId.toString() : null,
                shippingAddress: shippingInfo?.address || '',
                shippingCity: shippingInfo?.city || '',
                shippingState: shippingInfo?.state || '',
                shippingPostalCode: shippingInfo?.postalCode || '',
                customerEmail: paymentData.payer?.email || '',
                customerPhone: shippingInfo?.phone || '',
                items,
              },
            });
          });
        } else if (type === 'plan') {
          // Crear orden de plan
          const planId = metadata.plan_id ? parseInt(metadata.plan_id, 10) : null;
          const plan = planId
            ? await prisma.plan.findUnique({
                where: { id: planId },
                select: { title: true },
              })
            : null;

          await prisma.order.create({
            data: {
              userId,
              totalAmount: paymentData.transaction_amount!,
              status: 'COMPLETED',
              paymentMethod: 'MERCADOPAGO',
              paymentId: paymentId.toString(),
              ...(planId ? { planId } : {}),
              customerEmail: paymentData.payer?.email || '',
              items: [
                {
                  type: 'plan',
                  ...(planId ? { planId } : {}),
                  price: paymentData.transaction_amount!,
                },
              ],
            },
          });

          if (userId) {
            const userProfile = await prisma.user.findUnique({
              where: { id: userId },
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
              userEmail: userProfile?.email ?? null,
              planTitle: plan?.title || 'Plan',
              fitnessProfileData:
                (userProfile?.fitnessProfileData as Record<string, unknown> | null) ??
                fallbackProfileData,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing MercadoPago webhook:', error);

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
          paymentProvider: 'MERCADOPAGO',
          paymentId: paymentId ? paymentId.toString() : null,
          context: 'mercadopago-webhook',
        },
      });

      await prisma.retryEvent.create({
        data: {
          paymentProvider: 'MERCADOPAGO',
          paymentId: paymentId ? paymentId.toString() : null,
          reason: 'STOCK_INSUFFICIENT',
          context: Number.isFinite(productId) ? `productId:${productId}` : null,
        },
      });

      return NextResponse.json(
        { error: 'Stock insuficiente para uno o más productos' },
        { status: 500 }
      );
    }

    await prisma.retryEvent.create({
      data: {
        paymentProvider: 'MERCADOPAGO',
        paymentId: paymentId ? paymentId.toString() : null,
        reason: error?.message || 'UNKNOWN',
        context: 'mercadopago-webhook',
      },
    });

    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}

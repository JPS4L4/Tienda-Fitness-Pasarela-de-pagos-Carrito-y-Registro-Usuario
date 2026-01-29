import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { paymentIntentId, type, items, planId, shippingInfo } = await request.json();
    const parsedUserId = session?.user?.id ? parseInt(session.user.id, 10) : null;

    // Verificar el Payment Intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'El pago no se completó correctamente' },
        { status: 400 }
      );
    }

    // Crear orden en la base de datos
    if (type === 'cart') {
      // Orden de carrito
      const order = await prisma.order.create({
        data: {
          userId: Number.isFinite(parsedUserId) ? parsedUserId : null,
          totalAmount: paymentIntent.amount / 100,
          status: 'COMPLETED',
          paymentMethod: 'STRIPE',
          paymentId: paymentIntentId,
          shippingAddress: shippingInfo.address,
          shippingCity: shippingInfo.city,
          shippingState: shippingInfo.state,
          shippingPostalCode: shippingInfo.postalCode,
          customerEmail: shippingInfo.email,
          customerPhone: shippingInfo.phone,
          items: items,
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        message: '¡Pago exitoso! Tu pedido ha sido confirmado.',
      });
    } else if (type === 'plan' && planId) {
      // Suscripción a plan
      if (!session?.user?.id || !Number.isFinite(parsedUserId)) {
        return NextResponse.json(
          { error: 'Debes iniciar sesión para suscribirte' },
          { status: 401 }
        );
      }

      // Obtener datos del plan
      const plan = await prisma.plan.findUnique({
        where: { id: parseInt(planId) },
      });

      if (!plan) {
        return NextResponse.json(
          { error: 'Plan no encontrado' },
          { status: 404 }
        );
      }

      // Crear orden con suscripción
      const order = await prisma.order.create({
        data: {
          userId: parsedUserId!,
          totalAmount: paymentIntent.amount / 100,
          status: 'COMPLETED',
          paymentMethod: 'STRIPE',
          paymentId: paymentIntentId,
          planId: parseInt(planId),
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

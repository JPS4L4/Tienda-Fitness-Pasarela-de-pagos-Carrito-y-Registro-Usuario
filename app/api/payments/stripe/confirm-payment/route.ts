import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CURRENCY, ORDER_STATUS, PAYMENT_METHOD } from '@/lib/orders/constants';
import { StockError, fulfillOrder } from '@/lib/orders/fulfillment';
import { toMinorUnits } from '@/lib/money';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'El pago con tarjeta no está disponible' },
        { status: 503 }
      );
    }

    const session = await auth();
    const { paymentIntentId } = await request.json();
    if (typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
      return NextResponse.json({ error: 'Pago inválido' }, { status: 400 });
    }

    // La orden la creó el servidor al iniciar el pago: de ahí salen items, monto y dueño.
    const order = await prisma.order.findFirst({
      where: { paymentId: paymentIntentId, paymentMethod: PAYMENT_METHOD.STRIPE },
    });
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Propiedad: si la orden tiene dueño, debe ser el usuario de la sesión.
    const sessionUserId = session?.user?.id ? Number.parseInt(session.user.id, 10) : null;
    if (order.userId !== null && order.userId !== sessionUserId) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Verificación con la API de Stripe (estado, monto y moneda), no con lo que dice el cliente.
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'El pago no se completó correctamente' },
        { status: 400 }
      );
    }
    if (
      paymentIntent.amount !== toMinorUnits(order.totalAmount) ||
      paymentIntent.currency.toUpperCase() !== CURRENCY
    ) {
      console.error('Stripe amount/currency mismatch for order', order.id);
      return NextResponse.json({ error: 'El monto del pago no coincide' }, { status: 400 });
    }

    const { order: fulfilled } = await fulfillOrder(order.id, {
      method: PAYMENT_METHOD.STRIPE,
      paymentId: paymentIntent.id,
    });
    if (fulfilled.status !== ORDER_STATUS.COMPLETED) {
      return NextResponse.json({ error: 'La orden no está disponible' }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      orderId: fulfilled.id,
      message: fulfilled.planId
        ? '¡Suscripción exitosa! Ya tienes acceso a tu plan.'
        : '¡Pago exitoso! Tu pedido ha sido confirmado.',
    });
  } catch (error) {
    if (error instanceof StockError) {
      return NextResponse.json(
        { error: 'Stock insuficiente para uno o más productos' },
        { status: 409 }
      );
    }
    console.error('Error confirming payment:', error);
    return NextResponse.json({ error: 'Error al confirmar el pago' }, { status: 500 });
  }
}

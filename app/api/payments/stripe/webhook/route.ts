import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { CURRENCY, PAYMENT_METHOD } from '@/lib/orders/constants';
import { StockError, fulfillOrder, toMinorUnits } from '@/lib/orders/fulfillment';

// El webhook solo está activo si existen STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET.
// Sin ellos responde 503 y no procesa nada (la confirmación directa sigue funcionando).
export async function POST(request: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Firma ausente' }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' });

  let event: Stripe.Event;
  try {
    // Se necesita el cuerpo crudo: la firma se calcula sobre los bytes exactos.
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true });
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  try {
    const order = await prisma.order.findFirst({
      where: { paymentId: paymentIntent.id, paymentMethod: PAYMENT_METHOD.STRIPE },
    });
    if (!order) {
      console.warn('Stripe webhook: no hay orden para el PaymentIntent', paymentIntent.id);
      return NextResponse.json({ received: true });
    }

    if (
      paymentIntent.amount !== toMinorUnits(order.totalAmount) ||
      paymentIntent.currency.toUpperCase() !== CURRENCY
    ) {
      console.error('Stripe webhook: monto/moneda no coinciden para la orden', order.id);
      return NextResponse.json({ received: true });
    }

    // Idempotente: si /confirm-payment ya la procesó, no hace nada.
    await fulfillOrder(order.id, {
      method: PAYMENT_METHOD.STRIPE,
      paymentId: paymentIntent.id,
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof StockError) {
      // Reintentar no arregla el stock; queda registrado en StockAlert/RetryEvent.
      return NextResponse.json({ received: true });
    }
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}

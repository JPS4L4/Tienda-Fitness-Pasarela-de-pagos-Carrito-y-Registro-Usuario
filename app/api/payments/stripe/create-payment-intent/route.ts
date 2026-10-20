import { requireLiveMode } from '@/lib/payments/mode';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { prepareCheckout, cancelPendingOrder } from '@/lib/orders/checkout';
import { CheckoutError } from '@/lib/orders/pricing';
import { CURRENCY, PAYMENT_METHOD } from '@/lib/orders/constants';
import { toMinorUnits } from '@/lib/money';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' })
  : null;

export async function POST(request: NextRequest) {
  // Pasarela real: solo con PAYMENT_MODE=live. En modo demo no se llama a ninguna API externa.
  const demoBlock = requireLiveMode();
  if (demoBlock) return demoBlock;

  let orderId: number | null = null;
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'El pago con tarjeta no está disponible' },
        { status: 503 }
      );
    }

    // El monto enviado por el cliente se ignora: el total sale de la BD.
    const body = await request.json();
    const checkout = await prepareCheckout(body, PAYMENT_METHOD.STRIPE);
    orderId = checkout.orderId;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toMinorUnits(checkout.total), // COP en Stripe: pesos x 100
      currency: CURRENCY.toLowerCase(),
      metadata: {
        type: checkout.type,
        orderId: String(checkout.orderId),
        userId: checkout.userId ? String(checkout.userId) : 'guest',
      },
    });

    await prisma.order.update({
      where: { id: checkout.orderId },
      data: { paymentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: checkout.orderId,
      amount: checkout.total,
    });
  } catch (error) {
    if (orderId) await cancelPendingOrder(orderId).catch(() => undefined);
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: 'Error al crear el pago' }, { status: 500 });
  }
}

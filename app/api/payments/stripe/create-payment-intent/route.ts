import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { amount, type, items, planId, shippingInfo } = await request.json();

    // Validar datos
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
    }

    // Crear Payment Intent
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.checkoutSession.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        status: { not: 'COMPLETED' },
      },
    });
    const parsedUserId = session?.user?.id ? parseInt(session.user.id, 10) : null;

    const checkoutSession = type === 'cart'
      ? await prisma.checkoutSession.create({
          data: {
            userId: Number.isFinite(parsedUserId) ? parsedUserId : null,
            type: 'cart',
            amount,
            currency: 'COP',
            items,
            shippingInfo,
            paymentProvider: 'STRIPE',
            expiresAt,
          },
        })
      : null;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'cop', // Peso colombiano
      metadata: {
        type,
        userId: session?.user?.id?.toString() || 'guest',
        ...(type === 'cart'
          ? {
              itemCount: Array.isArray(items) ? items.length.toString() : '0',
              checkoutId: checkoutSession?.id || '',
            }
          : { planId: planId?.toString() || '' }),
      },
    });

    if (checkoutSession) {
      await prisma.checkoutSession.update({
        where: { id: checkoutSession.id },
        data: { paymentIntentId: paymentIntent.id },
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      checkoutSessionId: checkoutSession?.id || null,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear el pago' },
      { status: 500 }
    );
  }
}

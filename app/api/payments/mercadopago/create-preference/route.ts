import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    const session = await getServerSession(authOptions);
    const { amount, type, items, planId, shippingInfo } = await request.json();

    const rawReturnBaseUrl =
      process.env.MERCADOPAGO_RETURN_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL;

    const returnBaseUrl = rawReturnBaseUrl
      ? rawReturnBaseUrl.startsWith('http')
        ? rawReturnBaseUrl
        : `https://${rawReturnBaseUrl}`
      : undefined;

    if (!returnBaseUrl) {
      return NextResponse.json(
        { error: 'No se pudo determinar la URL base para las redirecciones' },
        { status: 500 }
      );
    }

    const successUrl = new URL('/checkout/success', returnBaseUrl).toString();
    const failureUrl = new URL('/checkout/failure', returnBaseUrl).toString();
    const pendingUrl = new URL('/checkout/pending', returnBaseUrl).toString();

    const notificationBaseUrl =
      process.env.MERCADOPAGO_NOTIFICATION_URL || returnBaseUrl;
    const notificationUrl = new URL(
      '/api/payments/mercadopago/webhook',
      notificationBaseUrl
    ).toString();

    // Validar datos
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
    }

    // Preparar items para MercadoPago
    const mpItems = type === 'cart'
      ? items.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.discount
            ? Math.round(item.price * (1 - item.discount / 100))
            : item.price,
          currency_id: 'COP',
        }))
      : [
          {
            title: `Plan de entrenamiento`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'COP',
          },
        ];

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
            paymentProvider: 'MERCADOPAGO',
            expiresAt,
          },
        })
      : null;

    // Crear preferencia de pago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          email: shippingInfo?.email || session?.user?.email || '',
          ...(shippingInfo?.phone && {
            phone: {
              number: shippingInfo.phone,
            },
          }),
        },
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        notification_url: notificationUrl,
        auto_return: 'approved',
        metadata: {
          type,
          user_id: session?.user?.id || 'guest',
          ...(type === 'cart'
            ? { checkout_id: checkoutSession?.id || '' }
            : { plan_id: planId }),
        },
      },
    });

    const isSandbox = accessToken.startsWith('TEST-');
    const resolvedInitPoint = isSandbox ? result.sandbox_init_point : result.init_point;

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: resolvedInitPoint,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('Error creating MercadoPago preference:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la preferencia de pago' },
      { status: 500 }
    );
  }
}

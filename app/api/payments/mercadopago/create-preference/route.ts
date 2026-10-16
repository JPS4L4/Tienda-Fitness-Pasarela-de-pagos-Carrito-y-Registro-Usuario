import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { auth } from '@/lib/nextAuth';
import { prepareCheckout, cancelPendingOrder } from '@/lib/orders/checkout';
import { CheckoutError } from '@/lib/orders/pricing';
import { CURRENCY, PAYMENT_METHOD } from '@/lib/orders/constants';

export async function POST(request: NextRequest) {
  let orderId: number | null = null;
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'El pago con MercadoPago no está disponible' },
        { status: 503 }
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
    });

    const session = await auth();
    // El monto enviado por el cliente se ignora: el total sale de la BD.
    const body = await request.json();

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

    const checkout = await prepareCheckout(body, PAYMENT_METHOD.MERCADOPAGO);
    orderId = checkout.orderId;

    // Items de MercadoPago a partir de los precios calculados en el servidor
    const mpItems =
      checkout.type === 'cart'
        ? checkout.lines.map((line) => ({
            id: String(line.productId),
            title: line.title,
            quantity: line.quantity,
            unit_price: line.price,
            currency_id: CURRENCY,
          }))
        : [
            {
              id: `plan-${checkout.orderId}`,
              title: checkout.planTitle || 'Plan de entrenamiento',
              quantity: 1,
              unit_price: checkout.total,
              currency_id: CURRENCY,
            },
          ];

    const shippingInfo = body?.shippingInfo;

    // Crear preferencia de pago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          email:
            (checkout.type === 'cart' ? shippingInfo?.email : undefined) ||
            session?.user?.email ||
            '',
        },
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        notification_url: notificationUrl,
        auto_return: 'approved',
        // La orden PENDING del servidor es la referencia: el webhook la resuelve por aquí.
        external_reference: String(checkout.orderId),
        metadata: {
          type: checkout.type,
          order_id: checkout.orderId,
        },
      },
    });

    const isSandbox = accessToken.startsWith('TEST-');
    const resolvedInitPoint = isSandbox ? result.sandbox_init_point : result.init_point;

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: resolvedInitPoint,
      sandboxInitPoint: result.sandbox_init_point,
      orderId: checkout.orderId,
    });
  } catch (error) {
    if (orderId) await cancelPendingOrder(orderId).catch(() => undefined);
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error creating MercadoPago preference:', error);
    return NextResponse.json(
      { error: 'Error al crear la preferencia de pago' },
      { status: 500 }
    );
  }
}

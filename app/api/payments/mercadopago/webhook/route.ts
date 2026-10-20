import { requireLiveMode } from '@/lib/payments/mode';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';
import { CURRENCY, PAYMENT_METHOD } from '@/lib/orders/constants';
import { StockError, fulfillOrder } from '@/lib/orders/fulfillment';

/**
 * Verifica la firma x-signature de MercadoPago:
 * manifest = "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" firmado con HMAC-SHA256.
 */
function isValidSignature(request: NextRequest, dataId: string, secret: string) {
  const header = request.headers.get('x-signature');
  if (!header) return false;

  const parts = Object.fromEntries(
    header.split(',').map((part) => {
      const [key, ...value] = part.trim().split('=');
      return [key, value.join('=')];
    })
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const requestId = request.headers.get('x-request-id');
  const manifest =
    `id:${dataId.toLowerCase()};` + (requestId ? `request-id:${requestId};` : '') + `ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  // Pasarela real: solo con PAYMENT_MODE=live. En modo demo no se llama a ninguna API externa.
  const demoBlock = requireLiveMode();
  if (demoBlock) return demoBlock;

  let paymentId: string | undefined;
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Webhook no configurado' }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));

    const eventType = body?.type || body?.topic || body?.action;
    const isPaymentEvent =
      eventType === 'payment' ||
      (typeof eventType === 'string' && eventType.startsWith('payment'));
    if (!isPaymentEvent) {
      return NextResponse.json({ received: true });
    }

    const rawResource = typeof body?.resource === 'string'
      ? body.resource.split('/').pop()
      : undefined;
    const rawId =
      request.nextUrl.searchParams.get('data.id') || body?.data?.id || body?.id || rawResource;
    if (!rawId) {
      return NextResponse.json({ error: 'No se recibió paymentId en el webhook' }, { status: 400 });
    }
    paymentId = String(rawId);

    // Con MERCADOPAGO_WEBHOOK_SECRET la firma es obligatoria; sin él se sigue confiando solo
    // en la consulta a la API de MercadoPago (el cuerpo del webhook nunca se usa para cobrar).
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (webhookSecret && !isValidSignature(request, paymentId, webhookSecret)) {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentData = await new Payment(client).get({ id: paymentId });

    if (paymentData.status !== 'approved') {
      return NextResponse.json({ received: true });
    }

    // La orden PENDING la creó el servidor y viaja como external_reference.
    const orderId = Number(paymentData.external_reference);
    const order = Number.isInteger(orderId)
      ? await prisma.order.findFirst({
          where: { id: orderId, paymentMethod: PAYMENT_METHOD.MERCADOPAGO },
        })
      : null;
    if (!order) {
      console.warn('MercadoPago webhook: pago sin orden asociada', paymentId);
      return NextResponse.json({ received: true });
    }

    const paidAmount = Number(paymentData.transaction_amount);
    const currencyOk = !paymentData.currency_id || paymentData.currency_id === CURRENCY;
    if (!(Math.abs(paidAmount - order.totalAmount) < 0.01) || !currencyOk) {
      console.error('MercadoPago webhook: monto/moneda no coinciden para la orden', order.id);
      return NextResponse.json({ received: true });
    }

    // Idempotente: reintentos del webhook no duplican orden, stock ni suscripción.
    await fulfillOrder(order.id, { method: PAYMENT_METHOD.MERCADOPAGO, paymentId });
    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof StockError) {
      // Reintentar no arregla el stock; queda registrado en StockAlert/RetryEvent.
      return NextResponse.json({ received: true });
    }

    console.error('Error processing MercadoPago webhook:', error);
    await prisma.retryEvent
      .create({
        data: {
          paymentProvider: PAYMENT_METHOD.MERCADOPAGO,
          paymentId: paymentId ?? null,
          reason: 'WEBHOOK_ERROR',
          context: 'mercadopago-webhook',
        },
      })
      .catch(() => undefined);

    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}

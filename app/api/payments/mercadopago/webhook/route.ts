import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MercadoPago envía notificaciones de tipo 'payment'
    if (body.type === 'payment') {
      const paymentId = body.data.id;

      // Obtener detalles del pago
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      // Verificar que el pago fue aprobado
      if (paymentData.status === 'approved') {
        const metadata = paymentData.metadata as any;
        const type = metadata.type;
        const userIdRaw = metadata.user_id !== 'guest' ? metadata.user_id : null;
        const userId = userIdRaw ? parseInt(userIdRaw, 10) : null;

        if (type === 'cart') {
          // Crear orden de carrito
          const items = JSON.parse(metadata.items);
          const shippingInfo = metadata.shipping_info
            ? JSON.parse(metadata.shipping_info)
            : null;

          await prisma.order.create({
            data: {
              userId,
              totalAmount: paymentData.transaction_amount!,
              status: 'COMPLETED',
              paymentMethod: 'MERCADOPAGO',
              paymentId: paymentId.toString(),
              shippingAddress: shippingInfo?.address || '',
              shippingCity: shippingInfo?.city || '',
              shippingState: shippingInfo?.state || '',
              shippingPostalCode: shippingInfo?.postalCode || '',
              customerEmail: paymentData.payer?.email || '',
              customerPhone: shippingInfo?.phone || '',
              items,
            },
          });
        } else if (type === 'plan') {
          // Crear orden de plan
          const planId = parseInt(metadata.plan_id);

          await prisma.order.create({
            data: {
              userId,
              totalAmount: paymentData.transaction_amount!,
              status: 'COMPLETED',
              paymentMethod: 'MERCADOPAGO',
              paymentId: paymentId.toString(),
              planId,
              customerEmail: paymentData.payer?.email || '',
              items: [
                {
                  type: 'plan',
                  planId,
                  price: paymentData.transaction_amount!,
                },
              ],
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing MercadoPago webhook:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}

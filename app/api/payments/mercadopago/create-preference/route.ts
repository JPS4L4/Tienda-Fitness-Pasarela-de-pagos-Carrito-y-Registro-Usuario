import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { amount, type, items, planId, shippingInfo } = await request.json();

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
          success: `${process.env.NEXTAUTH_URL}/checkout/success`,
          failure: `${process.env.NEXTAUTH_URL}/checkout/failure`,
          pending: `${process.env.NEXTAUTH_URL}/checkout/pending`,
        },
        auto_return: 'approved',
        metadata: {
          type,
          userId: session?.user?.id || 'guest',
          ...(type === 'cart' ? { items: JSON.stringify(items) } : { planId }),
          ...(shippingInfo && { shippingInfo: JSON.stringify(shippingInfo) }),
        },
      },
    });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
    });
  } catch (error: any) {
    console.error('Error creating MercadoPago preference:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la preferencia de pago' },
      { status: 500 }
    );
  }
}

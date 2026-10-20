import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/nextAuth';
import { CheckoutError } from '@/lib/orders/pricing';
import { confirmDemoPayment } from '@/lib/orders/demoPayment';
import { requireDemoMode } from '@/lib/payments/mode';

/**
 * Pago simulado, paso 2: valida la tarjeta de prueba y completa (o rechaza) la orden.
 * Solo existe en modo demo. El número de tarjeta y el CVC no se guardan ni se registran.
 */
export async function POST(request: NextRequest) {
  const notDemo = requireDemoMode();
  if (notDemo) return notDemo;

  try {
    const session = await auth();
    const parsedUserId = session?.user?.id ? Number.parseInt(session.user.id, 10) : NaN;
    const body = await request.json().catch(() => ({}));

    const result = await confirmDemoPayment({
      orderId: body?.orderId,
      card: body?.card,
      guestToken: body?.guestToken,
      sessionUserId: Number.isInteger(parsedUserId) ? parsedUserId : null,
    });

    if (result.status === 'declined') {
      return NextResponse.json(
        { success: false, orderId: result.orderId, code: result.code, error: result.reason },
        { status: 402 }
      );
    }
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error confirmando el pago demo:', error);
    return NextResponse.json({ error: 'Error al confirmar el pago' }, { status: 500 });
  }
}

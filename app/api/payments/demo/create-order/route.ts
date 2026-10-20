import { NextRequest, NextResponse } from 'next/server';
import { prepareCheckout } from '@/lib/orders/checkout';
import { CheckoutError } from '@/lib/orders/pricing';
import { PAYMENT_METHOD } from '@/lib/orders/constants';
import { requireDemoMode } from '@/lib/payments/mode';

/**
 * Pago simulado, paso 1: crea la orden PENDING (precio calculado por el servidor).
 * Solo existe en modo demo; no llama a ninguna API externa.
 */
export async function POST(request: NextRequest) {
  const notDemo = requireDemoMode();
  if (notDemo) return notDemo;

  try {
    const body = await request.json().catch(() => ({}));
    const checkout = await prepareCheckout(body, PAYMENT_METHOD.DEMO);
    return NextResponse.json({
      orderId: checkout.orderId,
      amount: checkout.total,
      // Solo para invitados: prueba de propiedad para pagar y ver el comprobante.
      guestToken: checkout.guestToken ?? null,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error creando la orden demo:', error);
    return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 });
  }
}

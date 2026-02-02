import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/orders/lookup?orderId=1 | paymentId=123
 * Obtiene una orden por ID o por paymentId (para voucher post-pago).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: 'Debe enviar orderId o paymentId' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: orderId
        ? { id: parseInt(orderId, 10) }
        : { paymentId: paymentId! },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error buscando orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

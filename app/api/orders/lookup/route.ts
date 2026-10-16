import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/adminAuth';

/**
 * GET /api/orders/lookup?orderId=1 | paymentId=123
 * Devuelve una orden (voucher post-pago) solo a su dueño autenticado (o a un admin).
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? Number.parseInt(session.user.id, 10) : NaN;
    if (!session?.user || !Number.isInteger(userId)) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderIdParam = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderIdParam && !paymentId) {
      return NextResponse.json(
        { error: 'Debe enviar orderId o paymentId' },
        { status: 400 }
      );
    }

    let where;
    if (orderIdParam) {
      const orderId = Number(orderIdParam);
      if (!Number.isInteger(orderId)) {
        return NextResponse.json({ error: 'orderId inválido' }, { status: 400 });
      }
      where = { id: orderId };
    } else {
      where = { paymentId: paymentId! };
    }

    const order = await prisma.order.findFirst({
      where,
      omit: { accessToken: true },
    });

    // Misma respuesta para "no existe" y "no es tuya": no revela qué órdenes existen.
    if (!order || (order.userId !== userId && !isAdminEmail(session.user.email))) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
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

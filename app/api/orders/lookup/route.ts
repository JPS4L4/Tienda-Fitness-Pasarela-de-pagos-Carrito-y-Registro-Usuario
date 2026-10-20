import { NextResponse } from 'next/server';
import { auth } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/adminAuth';
import { canViewOrder, toOrderView } from '@/lib/orders/lookup';

/**
 * GET /api/orders/lookup?orderId=1[&t=<token>] | paymentId=123
 * Devuelve una orden (voucher post-pago) a su dueño autenticado, a un admin o, para órdenes de
 * invitado, a quien presente el token firmado `t` que recibió al crear la orden.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderIdParam = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    const guestToken = searchParams.get('t');

    if (!orderIdParam && !paymentId) {
      return NextResponse.json(
        { error: 'Debe enviar orderId o paymentId' },
        { status: 400 }
      );
    }

    const session = await auth();
    const parsedUserId = session?.user?.id ? Number.parseInt(session.user.id, 10) : NaN;
    const userId = Number.isInteger(parsedUserId) ? parsedUserId : null;
    // El token solo sirve con orderId: por paymentId hace falta sesión.
    if (userId === null && !(orderIdParam && guestToken)) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
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

    const viewer = { userId, isAdmin: Boolean(session?.user?.email && isAdminEmail(session.user.email)) };
    // Misma respuesta para "no existe" y "no es tuya": no revela qué órdenes existen.
    if (!order || !canViewOrder(order, viewer, orderIdParam ? guestToken : null)) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    return NextResponse.json(toOrderView(order));
  } catch (error) {
    console.error('Error buscando orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/orders/[orderId]/confirm
 * Confirma el pago de una orden y activa la suscripción si es un plan
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { paymentIntentId } = body;

    const { orderId: orderIdParam } = await params;
    const orderId = parseInt(orderIdParam);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID de orden inválido' },
        { status: 400 }
      );
    }

    // Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar el estado de la orden
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'paid',
      },
    });

    // Si es un plan, crear la suscripción del usuario
    if (order.planId && order.accessToken && order.userId) {
      await prisma.userSubscription.create({
        data: {
          userId: order.userId,
          planId: order.planId,
          orderId: order.id,
          status: 'active',
          accessToken: order.accessToken,
          startDate: new Date(),
          endDate: order.tokenExpiresAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: order.planId ? 'Suscripción activada exitosamente' : 'Pago confirmado',
    });

  } catch (error) {
    console.error('Error confirmando orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

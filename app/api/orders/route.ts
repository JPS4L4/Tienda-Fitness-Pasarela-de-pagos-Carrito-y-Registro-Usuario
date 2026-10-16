import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/orders
 * Obtiene las órdenes del usuario autenticado
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: parseInt(session.user.id as string),
      },
      // Sin accessToken ni datos internos de la pasarela
      omit: { accessToken: true },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

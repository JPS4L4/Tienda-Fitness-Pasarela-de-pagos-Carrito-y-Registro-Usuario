import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toCommentsUIList } from '@/app/src/adapters/commentsAdapter';

/**
 * GET /api/comments
 * Obtiene todos los comentarios/reviews con información del usuario
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const productId = searchParams.get('productId');
    const planId = searchParams.get('planId');

    // Construir filtros dinámicamente
    const where: any = {};
    if (productId) {
      where.productId = parseInt(productId);
    }
    if (planId) {
      where.planId = parseInt(planId);
    }

    // Obtener reviews desde la base de datos
    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    });

    // Transformar a formato UI
    const commentsUI = toCommentsUIList(reviews);

    return NextResponse.json(commentsUI);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Error al obtener comentarios' },
      { status: 500 }
    );
  }
}

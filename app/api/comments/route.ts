import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toCommentsUIList } from '@/app/src/adapters/commentsAdapter';
import { auth } from '@/lib/auth';
import { validateRegisterForm } from '@/lib/validation';

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

/**
 * POST /api/comments
 * Crea una nueva review (requiere autenticación)
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para crear una reseña' },
        { status: 401 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { rating, content, productId, planId } = body;

    // Validaciones
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La calificación debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'El contenido debe tener al menos 10 caracteres' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'El contenido no puede exceder 500 caracteres' },
        { status: 400 }
      );
    }

    // Obtener el ID del usuario desde la sesión
    const userId = parseInt(session.user.id);

    // Crear la review en la base de datos
    const newReview = await prisma.review.create({
      data: {
        userId,
        rating,
        comment: content.trim(), // Campo 'comment' según schema de Prisma
        productId: productId ? parseInt(productId) : null,
        planId: planId ? parseInt(planId) : null,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Reseña creada exitosamente',
        review: newReview,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Error al crear la reseña' },
      { status: 500 }
    );
  }
}


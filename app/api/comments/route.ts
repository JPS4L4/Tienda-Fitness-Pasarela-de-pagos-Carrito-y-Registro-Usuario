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

    const parsedProductId = productId ? parseInt(productId) : null;
    const parsedPlanId = planId ? parseInt(planId) : null;

    if (parsedProductId && parsedPlanId) {
      return NextResponse.json(
        { error: 'Solo puedes calificar un producto o un plan a la vez' },
        { status: 400 }
      );
    }

    if (parsedProductId) {
      const existingReview = await prisma.review.findFirst({
        where: { userId, productId: parsedProductId },
        select: { id: true },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: 'Ya has dejado una reseña para este producto' },
          { status: 409 }
        );
      }

      const orders = await prisma.order.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
        select: { items: true },
      });

      const hasPurchased = orders.some((order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        return items.some((item: any) => {
          const itemProductId = item?.productId ?? item?.id;
          return Number(itemProductId) === parsedProductId;
        });
      });

      if (!hasPurchased) {
        return NextResponse.json(
          { error: 'Solo puedes calificar productos que hayas comprado' },
          { status: 403 }
        );
      }
    }

    if (parsedPlanId) {
      const existingReview = await prisma.review.findFirst({
        where: { userId, planId: parsedPlanId },
        select: { id: true },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: 'Ya has dejado una reseña para este plan' },
          { status: 409 }
        );
      }

      const orders = await prisma.order.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
        select: { items: true, planId: true },
      });

      const hasPurchased = orders.some((order) => {
        if (Number(order.planId) === parsedPlanId) {
          return true;
        }
        const items = Array.isArray(order.items) ? order.items : [];
        return items.some((item: any) => {
          const itemPlanId = item?.planId ?? item?.id;
          return Number(itemPlanId) === parsedPlanId;
        });
      });

      if (!hasPurchased) {
        return NextResponse.json(
          { error: 'Solo puedes calificar planes que hayas comprado' },
          { status: 403 }
        );
      }
    }

    // Crear la review en la base de datos y recalcular promedio si es producto
    const newReview = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          userId,
          rating,
          comment: content.trim(), // Campo 'comment' según schema de Prisma
          productId: parsedProductId,
          planId: parsedPlanId,
        },
        include: {
          user: true,
        },
      });

      if (parsedProductId) {
        const aggregate = await tx.review.aggregate({
          where: { productId: parsedProductId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.item.update({
          where: { id: parsedProductId },
          data: {
            rating: aggregate._avg.rating ?? 0,
            reviewCount: aggregate._count.rating ?? 0,
          },
        });
      }

      if (parsedPlanId) {
        const aggregate = await tx.review.aggregate({
          where: { planId: parsedPlanId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.plan.update({
          where: { id: parsedPlanId },
          data: {
            rating: aggregate._avg.rating ?? 0,
            reviewCount: aggregate._count.rating ?? 0,
          },
        });
      }

      return created;
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


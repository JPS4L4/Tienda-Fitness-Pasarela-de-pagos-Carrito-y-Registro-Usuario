import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { isTokenValid } from '@/lib/tokenService';

/**
 * GET /api/subscriptions/check?planId=123
 * Verifica si el usuario tiene acceso activo a un plan
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { hasAccess: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json(
        { hasAccess: false, error: 'Plan ID requerido' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id as string);

    // Buscar suscripción activa del usuario para este plan
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        planId: parseInt(planId),
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      return NextResponse.json({
        hasAccess: false,
        message: 'No tienes una suscripción activa para este plan',
      });
    }

    // Verificar si el token no ha expirado
    const isValid = isTokenValid(subscription.endDate);

    if (!isValid) {
      // Marcar la suscripción como expirada
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
      });

      return NextResponse.json({
        hasAccess: false,
        message: 'Tu suscripción ha expirado',
      });
    }

    return NextResponse.json({
      hasAccess: true,
      subscription: {
        id: subscription.id,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        accessToken: subscription.accessToken,
      },
    });

  } catch (error) {
    console.error('Error verificando suscripción:', error);
    return NextResponse.json(
      { hasAccess: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscriptions (sin query params)
 * Obtiene todas las suscripciones del usuario autenticado
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id as string);

    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Agregar información del plan a cada suscripción
    const subscriptionsWithPlans = await Promise.all(
      subscriptions.map(async (sub) => {
        const plan = await prisma.plan.findUnique({
          where: { id: sub.planId },
          select: {
            id: true,
            title: true,
            type: true,
            image: true,
            slug: true,
          },
        });

        return {
          ...sub,
          plan,
          isValid: isTokenValid(sub.endDate),
        };
      })
    );

    return NextResponse.json(subscriptionsWithPlans);

  } catch (error) {
    console.error('Error obteniendo suscripciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

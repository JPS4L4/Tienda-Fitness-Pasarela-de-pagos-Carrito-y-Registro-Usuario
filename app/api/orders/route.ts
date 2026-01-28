import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, calculateExpirationDate, generateOrderId } from '@/lib/tokenService';

/**
 * POST /api/orders
 * Crea una nueva orden (carrito o plan)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const {
      type, // 'cart' | 'plan'
      planId,
      items,
      shippingInfo,
      total,
      subscriptionType = 'monthly' // Para planes: 'monthly' | 'quarterly' | 'yearly' | 'lifetime'
    } = body;

    // Validaciones
    if (!type || !total) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    if (type === 'plan' && !planId) {
      return NextResponse.json(
        { error: 'Plan ID requerido' },
        { status: 400 }
      );
    }

    if (type === 'plan' && !session?.user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para comprar un plan' },
        { status: 401 }
      );
    }

    // Generar token de acceso si es un plan
    const accessToken = type === 'plan' ? generateAccessToken() : null;
    const tokenExpiresAt = type === 'plan' ? calculateExpirationDate(subscriptionType) : null;

    // Crear la orden
    const order = await prisma.order.create({
      data: {
        userId: session?.user ? parseInt(session.user.id as string) : null,
        planId: type === 'plan' ? parseInt(planId) : null,
        email: type === 'cart' ? shippingInfo.email : session?.user?.email || '',
        phone: type === 'cart' ? shippingInfo.phone : null,
        total,
        status: 'pending',
        shippingAddress: type === 'cart' ? shippingInfo : null,
        items: type === 'cart' ? items : { planId, subscriptionType },
        accessToken,
        tokenExpiresAt,
        subscriptionType: type === 'plan' ? subscriptionType : null,
      },
    });

    // TODO: Aquí iría la integración con Stripe para crear el PaymentIntent
    // Por ahora simulamos un clientSecret
    const clientSecret = `pi_${generateOrderId()}_secret_${generateAccessToken().substring(0, 16)}`;

    return NextResponse.json({
      orderId: order.id,
      clientSecret,
      accessToken: type === 'plan' ? accessToken : undefined,
      expiresAt: type === 'plan' ? tokenExpiresAt : undefined,
    });

  } catch (error) {
    console.error('Error creando orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

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

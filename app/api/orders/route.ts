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

    if (type === 'cart' && (!shippingInfo || !items)) {
      return NextResponse.json(
        { error: 'Datos de envío o items faltantes' },
        { status: 400 }
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
        customerFirstName: type === 'cart' ? shippingInfo.firstName : null,
        customerLastName: type === 'cart' ? shippingInfo.lastName : null,
        customerEmail: type === 'cart' ? shippingInfo.email : session?.user?.email || '',
        customerPhone: type === 'cart' ? shippingInfo.phone : null,
        totalAmount: total,
        status: 'PENDING',
        shippingAddress: type === 'cart' ? shippingInfo.address : null,
        shippingCity: type === 'cart' ? shippingInfo.city : null,
        shippingState: type === 'cart' ? shippingInfo.state : null,
        shippingPostalCode: type === 'cart' ? shippingInfo.postalCode : null,
        items: type === 'cart'
          ? items
          : [{ planId: parseInt(planId), subscriptionType }],
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

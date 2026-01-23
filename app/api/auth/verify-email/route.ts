import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { generateToken, getTokenExpiry, sendVerificationEmail, isTokenExpired } from '@/lib/emailService';

const prisma = new PrismaClient();

/**
 * POST /api/auth/send-verification-email
 * Envía un email de verificación al usuario registrado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si ya está verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Este email ya está verificado' },
        { status: 400 }
      );
    }

    // Generar token
    const token = generateToken();
    const tokenExpiry = getTokenExpiry(24); // Expira en 24 horas

    // Guardar token en BD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: tokenExpiry,
      },
    });

    // Enviar email
    const emailSent = await sendVerificationEmail(
      user.email || '',
      user.name || 'Usuario',
      token
    );

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: 'Error al enviar email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Email de verificación enviado' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-email?token=xxx
 * Verifica el token y marca el email como verificado
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    // Buscar usuario con token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
      select: {
        id: true,
        email: true,
        emailVerificationTokenExpiry: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 404 }
      );
    }

    // Verificar si el token ha expirado
    if (isTokenExpired(user.emailVerificationTokenExpiry)) {
      return NextResponse.json(
        { success: false, error: 'El token ha expirado. Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    // Si ya está verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Este email ya está verificado' },
        { status: 400 }
      );
    }

    // Marcar como verificado
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Email verificado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verificando email:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

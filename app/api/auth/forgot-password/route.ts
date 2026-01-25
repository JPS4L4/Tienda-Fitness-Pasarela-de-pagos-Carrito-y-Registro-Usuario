import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'
import { generateToken, getTokenExpiry, sendPasswordResetEmail } from '@/lib/emailService';

const prisma = new PrismaClient();

/**
 * POST /api/auth/forgot-password
 * Envía email de reset con token
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
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      // No revelar si el email existe o no (seguridad)
      return NextResponse.json(
        { success: true, message: 'Si el email existe, recibirás un enlace de reset' },
        { status: 200 }
      );
    }

    // Generar token
    const token = generateToken();
    const tokenExpiry = getTokenExpiry(1); // Expira en 1 hora

    // Guardar token en BD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpiry: tokenExpiry,
      },
    });

    // Enviar email
    const emailSent = await sendPasswordResetEmail(
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
      { success: true, message: 'Email de recuperación enviado. Verifica tu bandeja de entrada.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en forgot password:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

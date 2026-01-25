import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'
import { isTokenExpired } from '@/lib/emailService';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * POST /api/auth/reset-password
 * Resetea la contraseña con un token válido
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Token y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Buscar usuario con token
        const user = await prisma.user.findFirst({
      where: { passwordResetToken: token },
      select: {
        id: true,
        email: true,
        passwordResetToken: true,
        passwordResetTokenExpiry: true,
      },
    });


    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 404 }
      );
    }

    // Verificar si el token ha expirado
    if (isTokenExpired(user.passwordResetTokenExpiry)) {
      return NextResponse.json(
        { success: false, error: 'El token ha expirado. Solicita un nuevo reset.' },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña y limpiar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });

    // Actualizar la contraseña en la tabla Account
    await prisma.account.updateMany({
      where: {
        userId: user.id,
        provider: 'credentials',
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Contraseña reseteada exitosamente. Puedes iniciar sesión.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/reset-password?token=xxx
 * Valida si el token es válido
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
   const user = await prisma.user.findFirst({
  where: { passwordResetToken: token },
  select: {
    passwordResetToken: true,
    passwordResetTokenExpiry: true,
  },
});


    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 404 }
      );
    }

    // Verificar si el token ha expirado
    if (isTokenExpired(user.passwordResetTokenExpiry)) {
      return NextResponse.json(
        { success: false, error: 'El token ha expirado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Token válido' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error validando token:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

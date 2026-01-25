import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  user?: {
    id: number;
    email: string | null;
    name: string | null;
  };
  error?: string;
}

/**
 * Validar credenciales de login
 * Compara el email y contraseña contra la BD
 */
export async function validateCredentials(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Buscar la cuenta con credenciales
    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'credentials',
      },
    });

    if (!account || !account.password) {
      return { success: false, error: 'Este usuario no tiene contraseña establecida' };
    }

    // Comparar contraseña con hash
    const isPasswordValid = await bcrypt.compare(password, account.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Error validando credenciales:', error);
    return { success: false, error: 'Error al validar credenciales' };
  }
}

/**
 * Registrar un nuevo usuario
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResult> {
  try {
    console.log('🔐 Iniciando registerUser para:', payload.email);

    // Verificar si el email ya existe
    console.log('🔐 Verificando si el email ya existe...');
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      console.log('❌ El email ya está registrado:', payload.email);
      return { success: false, error: 'El email ya está registrado' };
    }

    console.log('✅ Email disponible');

    // Hash de la contraseña
    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    console.log('✅ Contraseña hasheada');

    // Crear usuario y su cuenta en una transacción
    console.log('🔐 Creando usuario y cuenta...');
    const newUser = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        accounts: {
          create: {
            provider: 'credentials',
            password: hashedPassword,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log('✅ Usuario creado exitosamente:', newUser.id);

    return {
      success: true,
      user: newUser,
    };
  } catch (error) {
    console.error('❌ Error registrando usuario:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('📍 Error detallado:', errorMsg);
    return { success: false, error: errorMsg || 'Error al registrar usuario' };
  }
}

/**
 * Obtener todos los usuarios (para debug)
 */
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    return users;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
}

/**
 * Actualizar usuario
 */
export async function updateUser(
  userId: number,
  data: { name?: string; image?: string }
) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return { success: false, error: 'Error al actualizar usuario' };
  }
}

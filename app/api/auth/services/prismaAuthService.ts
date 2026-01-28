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

/**
 * Registrar o actualizar usuario OAuth (Google/Facebook)
 */
export async function registerOAuthUser(payload: {
  email: string;
  name?: string | null;
  image?: string | null;
  provider: string;
  providerAccountId: string;
}): Promise<AuthResult> {
  try {
    console.log(`🔐 Procesando login OAuth [${payload.provider}]:`, payload.email);

    // Buscar usuario existente por email
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        accounts: true,
      },
    });

    if (user) {
      console.log('✅ Usuario existente encontrado:', user.id);
      
      // Verificar si ya tiene una cuenta con este proveedor
      const hasProviderAccount = user.accounts.some(
        acc => acc.provider === payload.provider && acc.providerAccountId === payload.providerAccountId
      );

      if (!hasProviderAccount) {
        console.log(`🔗 Vinculando cuenta de ${payload.provider} al usuario existente`);
        await prisma.account.create({
          data: {
            userId: user.id,
            provider: payload.provider,
            providerAccountId: payload.providerAccountId,
          },
        });
      }

      // Actualizar imagen si viene del proveedor y el usuario no tiene una
      if (payload.image && !user.image) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: payload.image },
        });
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }

    // Crear nuevo usuario con cuenta OAuth
    console.log(`✨ Creando nuevo usuario desde ${payload.provider}`);
    const newUser = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name || null,
        image: payload.image || null,
        emailVerified: new Date(), // OAuth users are pre-verified
        accounts: {
          create: {
            provider: payload.provider,
            providerAccountId: payload.providerAccountId,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log('✅ Usuario OAuth creado exitosamente:', newUser.id);

    return {
      success: true,
      user: newUser,
    };
  } catch (error) {
    console.error(`❌ Error registrando usuario OAuth [${payload.provider}]:`, error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMsg || 'Error al registrar usuario OAuth' };
  }
}

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
}

interface AuthResult {
  success: boolean;
  user?: {
    id: number;
    email: string | null;
    name: string | null;
    phone?: string | null;
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
    const identifier = email;
    const user = await prisma.user.findUnique({
      where: { email: identifier },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
      },
    });

    const resolvedUser = user || await prisma.user.findFirst({
      where: {
        phone: identifier,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
      },
    });

    if (!resolvedUser) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Buscar la cuenta con credenciales
    const account = await prisma.account.findFirst({
      where: {
        userId: resolvedUser.id,
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
      user: {
        id: resolvedUser.id,
        email: resolvedUser.email,
        name: resolvedUser.name,
        phone: resolvedUser.phone || null,
      },
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

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: payload.email },
          ...(payload.phone ? [{ phone: payload.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === payload.email) {
        return { success: false, error: 'El email ya está registrado' };
      }
      if (payload.phone && existingUser.phone === payload.phone) {
        return { success: false, error: 'El teléfono ya está registrado' };
      }
      return { success: false, error: 'El usuario ya está registrado' };
    }


    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // Crear usuario y su cuenta en una transacción
    const newUser = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
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
        phone: true,
      },
    });


    return {
      success: true,
      user: newUser,
    };
  } catch (error) {
    console.error('❌ Error registrando usuario:', error);
    // El detalle del error queda solo en el log; al cliente va un mensaje genérico.
    return { success: false, error: 'Error al registrar usuario' };
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
        phone: true,
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
  data: { name?: string; image?: string; phone?: string | null }
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
        phone: true,
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
  /** El proveedor garantiza que el correo es del usuario */
  emailVerified?: boolean;
}): Promise<AuthResult> {
  try {

    // Buscar usuario existente por email
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        accounts: true,
      },
    });

    if (user) {
      
      // Verificar si ya tiene una cuenta con este proveedor
      const hasProviderAccount = user.accounts.some(
        acc => acc.provider === payload.provider && acc.providerAccountId === payload.providerAccountId
      );

      if (!hasProviderAccount) {
        // Vincular por correo sin verificación permitiría tomar una cuenta ajena.
        if (!payload.emailVerified) {
          console.error('❌ Correo no verificado por el proveedor; no se vincula a la cuenta existente');
          return { success: false, error: 'No se puede vincular la cuenta' };
        }
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
    const newUser = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name || null,
        image: payload.image || null,
        emailVerified: payload.emailVerified ? new Date() : null,
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


    return {
      success: true,
      user: newUser,
    };
  } catch (error) {
    console.error(`❌ Error registrando usuario OAuth [${payload.provider}]:`, error);
    return { success: false, error: 'Error al registrar usuario OAuth' };
  }
}

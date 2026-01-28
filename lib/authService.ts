/**
 * lib/authService.ts
 * Wrapper para las funciones de autenticación con Prisma
 * Esto facilita importar desde diferentes partes de la app
 */

export {
  validateCredentials,
  registerUser,
  registerOAuthUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '@/app/api/auth/services/prismaAuthService';

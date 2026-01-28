import crypto from 'crypto';

/**
 * Genera un token de acceso único para un plan
 */
export function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calcula la fecha de expiración según el tipo de suscripción
 */
export function calculateExpirationDate(subscriptionType: string): Date {
  const now = new Date();
  
  switch (subscriptionType) {
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      now.setMonth(now.getMonth() + 3);
      break;
    case 'yearly':
      now.setFullYear(now.getFullYear() + 1);
      break;
    case 'lifetime':
      // 100 años en el futuro = prácticamente lifetime
      now.setFullYear(now.getFullYear() + 100);
      break;
    default:
      // Por defecto 1 mes
      now.setMonth(now.getMonth() + 1);
  }
  
  return now;
}

/**
 * Verifica si un token de acceso es válido y no ha expirado
 */
export function isTokenValid(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() < new Date(expiresAt);
}

/**
 * Genera un identificador único de orden
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(4).toString('hex');
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
}

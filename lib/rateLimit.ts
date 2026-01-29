/**
 * lib/rateLimit.ts
 * Sistema de rate limiting para prevenir ataques de fuerza bruta
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000, blockDurationMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  /**
   * Verificar si una IP está bloqueada
   */
  isBlocked(identifier: string): boolean {
    const entry = this.attempts.get(identifier);
    
    if (!entry) {
      return false;
    }

    // Si está bloqueado y aún no expira el bloqueo
    if (entry.blockedUntil && Date.now() < entry.blockedUntil) {
      return true;
    }

    // Si expiró el bloqueo, resetear
    if (entry.blockedUntil && Date.now() >= entry.blockedUntil) {
      this.attempts.delete(identifier);
      return false;
    }

    return false;
  }

  /**
   * Registrar un intento
   */
  recordAttempt(identifier: string): { allowed: boolean; retryAfter?: number; attemptsLeft?: number } {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    // Si está bloqueado
    if (this.isBlocked(identifier)) {
      const blockedEntry = this.attempts.get(identifier);
      const retryAfter = blockedEntry?.blockedUntil 
        ? Math.ceil((blockedEntry.blockedUntil - now) / 1000)
        : 0;
      
      return { 
        allowed: false, 
        retryAfter 
      };
    }

    // Si no hay entrada o la ventana expiró, crear nueva
    if (!entry || now > entry.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      
      return { 
        allowed: true, 
        attemptsLeft: this.maxAttempts - 1 
      };
    }

    // Incrementar contador
    entry.count += 1;

    // Si excede el límite, bloquear
    if (entry.count > this.maxAttempts) {
      entry.blockedUntil = now + this.blockDurationMs;
      this.attempts.set(identifier, entry);
      
      return { 
        allowed: false, 
        retryAfter: Math.ceil(this.blockDurationMs / 1000) 
      };
    }

    this.attempts.set(identifier, entry);
    
    return { 
      allowed: true, 
      attemptsLeft: this.maxAttempts - entry.count 
    };
  }

  /**
   * Resetear intentos para un identificador
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Limpiar entradas expiradas (mantener memoria limpia)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
        this.attempts.delete(key);
      }
    }
  }
}

// Instancias globales para diferentes endpoints
export const loginLimiter = new RateLimiter(5, 15 * 60 * 1000, 15 * 60 * 1000); // 5 intentos en 15 min
export const registerLimiter = new RateLimiter(3, 60 * 60 * 1000, 30 * 60 * 1000); // 3 intentos en 1 hora
export const passwordResetLimiter = new RateLimiter(3, 60 * 60 * 1000, 60 * 60 * 1000); // 3 intentos en 1 hora

// Limpiar cada 5 minutos
setInterval(() => {
  loginLimiter.cleanup();
  registerLimiter.cleanup();
  passwordResetLimiter.cleanup();
}, 5 * 60 * 1000);

/**
 * Obtener identificador del cliente desde request
 */
export function getClientIdentifier(request: Request): string {
  // Intentar obtener IP real detrás de proxy
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  let ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';
  
  // Si es unknown, usar un identificador basado en headers (menos confiable pero mejor que nada)
  if (ip === 'unknown') {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    ip = `fallback-${Buffer.from(userAgent + acceptLanguage).toString('base64').slice(0, 20)}`;
  }
  
  return ip;
}

/**
 * Helper para aplicar rate limiting en API routes
 */
export async function applyRateLimit(
  request: Request,
  limiter: RateLimiter,
  endpoint: string
): Promise<{ allowed: boolean; response?: Response }> {
  const identifier = getClientIdentifier(request);
  const key = `${endpoint}:${identifier}`;
  
  const result = limiter.recordAttempt(key);
  
  if (!result.allowed) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: 'Demasiados intentos. Por favor espera antes de volver a intentar.',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter?.toString() || '900',
          },
        }
      ),
    };
  }
  
  return { allowed: true };
}

/**
 * lib/validation.ts
 * Utilidades de validación y sanitización para prevenir ataques
 */

// Expresiones regulares para validación
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]{2,50}$/;

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Sanitizar string removiendo caracteres peligrosos (XSS prevention)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover eventos onclick, onerror, etc.
    .slice(0, 500); // Limitar longitud
}

/**
 * Validar email con sanitización
 */
export function validateEmail(email: string): ValidationResult {
  const sanitized = sanitizeInput(email).toLowerCase();

  if (!sanitized) {
    return { valid: false, error: 'El email es requerido' };
  }

  if (sanitized.length > 254) {
    return { valid: false, error: 'El email es demasiado largo' };
  }

  if (!EMAIL_REGEX.test(sanitized)) {
    return { valid: false, error: 'El formato del email es inválido' };
  }

  // Prevenir emails maliciosos
  const dangerousPatterns = ['..', '@@', '<', '>', 'script'];
  if (dangerousPatterns.some(pattern => sanitized.includes(pattern))) {
    return { valid: false, error: 'El email contiene caracteres no permitidos' };
  }

  return { valid: true };
}

/**
 * Validar contraseña con requisitos de seguridad
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'La contraseña es requerida' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'La contraseña es demasiado larga' };
  }

  // Verificar complejidad
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  if (!hasUpperCase) {
    return { valid: false, error: 'La contraseña debe contener al menos una mayúscula' };
  }

  if (!hasLowerCase) {
    return { valid: false, error: 'La contraseña debe contener al menos una minúscula' };
  }

  if (!hasNumber) {
    return { valid: false, error: 'La contraseña debe contener al menos un número' };
  }

  if (!hasSpecialChar) {
    return { valid: false, error: 'La contraseña debe contener al menos un carácter especial (@$!%*?&)' };
  }

  // Prevenir contraseñas comunes
  const commonPasswords = ['Password1!', 'Admin123!', 'Welcome1!', 'Qwerty123!'];
  if (commonPasswords.includes(password)) {
    return { valid: false, error: 'Esta contraseña es muy común, elige otra' };
  }

  return { valid: true };
}

/**
 * Validar nombre de usuario
 */
export function validateName(name: string): ValidationResult {
  const sanitized = sanitizeInput(name);

  if (!sanitized) {
    return { valid: false, error: 'El nombre es requerido' };
  }

  if (sanitized.length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (sanitized.length > 50) {
    return { valid: false, error: 'El nombre es demasiado largo (máximo 50 caracteres)' };
  }

  if (!NAME_REGEX.test(sanitized)) {
    return { valid: false, error: 'El nombre contiene caracteres no permitidos' };
  }

  return { valid: true };
}

/**
 * Rate limiting simple en cliente (prevenir spam)
 */
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();

  /**
   * Verificar si se permite otra acción
   * @param key Identificador único (ej: 'login', 'register')
   * @param maxAttempts Número máximo de intentos
   * @param windowMs Ventana de tiempo en milisegundos
   */
  checkLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filtrar intentos dentro de la ventana de tiempo
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false; // Límite excedido
    }
    
    // Registrar nuevo intento
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  /**
   * Obtener tiempo restante de espera
   */
  getWaitTime(key: string, maxAttempts: number = 5, windowMs: number = 60000): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length < maxAttempts) {
      return 0;
    }
    
    const oldestAttempt = Math.min(...recentAttempts);
    const waitTime = windowMs - (now - oldestAttempt);
    
    return Math.max(0, Math.ceil(waitTime / 1000)); // Segundos
  }

  /**
   * Resetear intentos para una clave
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Verificar si el input contiene intentos de SQL Injection
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bOR\b|\bAND\b).*=.*\d+/i,
    /UNION.*SELECT/i,
    /DROP.*TABLE/i,
    /INSERT.*INTO/i,
    /DELETE.*FROM/i,
    /UPDATE.*SET/i,
    /--/,
    /;.*\bSELECT\b/i,
    /'\s*OR\s*'1'\s*=\s*'1/i,
    /"\s*OR\s*"1"\s*=\s*"1/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Verificar si el input contiene intentos de XSS
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<img.*on/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Validar y sanitizar todos los campos del formulario
 */
export function validateLoginForm(email: string, password: string): ValidationResult {
  // Detectar ataques
  if (detectSQLInjection(email) || detectSQLInjection(password)) {
    return { valid: false, error: 'Entrada sospechosa detectada' };
  }

  if (detectXSS(email) || detectXSS(password)) {
    return { valid: false, error: 'Entrada sospechosa detectada' };
  }

  // Validar email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  // Para login, validación de contraseña es más simple
  if (!password || password.length < 6 || password.length > 128) {
    return { valid: false, error: 'Contraseña inválida' };
  }

  return { valid: true };
}

/**
 * Validar formulario de registro
 */
export function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult {
  // Detectar ataques
  if (detectSQLInjection(name) || detectSQLInjection(email) || detectSQLInjection(password)) {
    return { valid: false, error: 'Entrada sospechosa detectada' };
  }

  if (detectXSS(name) || detectXSS(email) || detectXSS(password)) {
    return { valid: false, error: 'Entrada sospechosa detectada' };
  }

  // Validar nombre
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  // Validar email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  // Validar contraseña
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }

  // Confirmar contraseña
  if (password !== confirmPassword) {
    return { valid: false, error: 'Las contraseñas no coinciden' };
  }

  return { valid: true };
}

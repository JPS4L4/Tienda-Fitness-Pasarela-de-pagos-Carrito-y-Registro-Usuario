// lib/adminAuth.ts
// Reglas de administrador sin dependencias de servidor (se puede usar en middleware).
// Fail-closed: si ADMIN_EMAILS no está definida o está vacía, nadie es administrador.

export const getAdminEmails = (): string[] =>
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}

/** Cuenta de administración de demostración (credenciales públicas en el README). */
export const DEMO_ADMIN_EMAIL = 'admin@fitness-studio.example'

/** Mensaje 403 para cualquier mutación hecha con una cuenta de administración de solo lectura. */
export const READONLY_ADMIN_MESSAGE = 'La cuenta demo de administración es de solo lectura'

/**
 * Cuentas de administración que solo pueden leer. Siempre incluye la cuenta demo; la variable
 * DEMO_READONLY_ADMIN_EMAILS (lista separada por comas) añade más.
 */
export const getReadOnlyAdminEmails = (): string[] => [
  DEMO_ADMIN_EMAIL,
  ...(process.env.DEMO_READONLY_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
]

export const isReadOnlyAdminEmail = (email?: string | null): boolean => {
  if (!email) return false
  return getReadOnlyAdminEmails().includes(email.trim().toLowerCase())
}

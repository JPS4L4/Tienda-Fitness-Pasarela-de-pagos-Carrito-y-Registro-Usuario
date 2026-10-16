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

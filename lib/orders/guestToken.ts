// lib/orders/guestToken.ts
// Token firmado que prueba que quien lo tiene creó una orden de invitado (userId null).
// Sin esquema nuevo: HMAC-SHA256 con NEXTAUTH_SECRET sobre (orderId, expiración).
import crypto from 'node:crypto'

/** Vigencia del comprobante de invitado. */
export const GUEST_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

function secret(): string {
  const value = process.env.NEXTAUTH_SECRET
  if (!value) throw new Error('NEXTAUTH_SECRET es obligatoria para firmar el comprobante de invitado')
  return value
}

function signature(orderId: number, expiresAt: number): string {
  return crypto
    .createHmac('sha256', secret())
    .update(`guest-order:${orderId}:${expiresAt}`)
    .digest('base64url')
}

/** Formato: `<expiraEnMs>.<firma>`. */
export function signGuestOrderToken(orderId: number, now: number = Date.now()): string {
  const expiresAt = now + GUEST_TOKEN_TTL_MS
  return `${expiresAt}.${signature(orderId, expiresAt)}`
}

export function verifyGuestOrderToken(
  orderId: number,
  token: unknown,
  now: number = Date.now()
): boolean {
  if (typeof token !== 'string' || token.length > 200) return false
  const [expiresRaw, provided, ...rest] = token.split('.')
  if (rest.length > 0 || !expiresRaw || !provided || !/^\d+$/.test(expiresRaw)) return false

  const expiresAt = Number(expiresRaw)
  if (!Number.isSafeInteger(expiresAt) || expiresAt < now) return false

  const expected = Buffer.from(signature(orderId, expiresAt))
  const received = Buffer.from(provided)
  return expected.length === received.length && crypto.timingSafeEqual(expected, received)
}

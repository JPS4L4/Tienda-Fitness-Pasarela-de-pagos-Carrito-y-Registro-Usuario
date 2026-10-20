// lib/payments/card.ts
// Tarjeta del pago simulado: formato, validación y resultado por tarjeta de prueba.
// Módulo puro (sin Node ni React): lo usan el formulario del cliente y el servidor.
// El número completo y el CVC nunca se guardan: solo se valida y se conservan los 4 últimos dígitos.

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown'

export type CardInput = { number: string; holder: string; expiry: string; cvc: string }

export type DemoOutcome =
  | { approved: true }
  | { approved: false; code: 'insufficient_funds' | 'bank_declined'; reason: string }

export const TEST_CARDS = [
  { number: '4242 4242 4242 4242', label: 'Pago aprobado', approved: true },
  { number: '4000 0000 0000 0002', label: 'Rechazo: fondos insuficientes', approved: false },
  { number: '4000 0000 0000 9995', label: 'Rechazo: tarjeta rechazada por el banco', approved: false },
] as const

export const BRAND_LABEL: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  unknown: 'Tarjeta',
}

export const digitsOnly = (value: string) => value.replace(/\D/g, '')

export function detectBrand(number: string): CardBrand {
  const digits = digitsOnly(number)
  if (/^4/.test(digits)) return 'visa'
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^5[1-5]/.test(digits) || /^(222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/.test(digits)) return 'mastercard'
  return 'unknown'
}

const maxDigits = (brand: CardBrand) => (brand === 'amex' ? 15 : 16)

/** Agrupa mientras se escribe: 4-4-4-4 (Amex 4-6-5). */
export function formatCardNumber(value: string): string {
  const brand = detectBrand(value)
  const digits = digitsOnly(value).slice(0, maxDigits(brand))
  if (brand === 'amex') {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(' ')
  }
  return (digits.match(/.{1,4}/g) ?? []).join(' ')
}

/** "1228" -> "12/28"; escribe el separador solo cuando hay más de dos dígitos. */
export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export function passesLuhn(number: string): boolean {
  const digits = digitsOnly(number)
  if (digits.length < 12) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

/** La tarjeta vale hasta el último día del mes indicado. */
export function isExpiryInFuture(expiry: string, now: Date = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry.trim())
  if (!match) return false
  const month = Number(match[1])
  if (month < 1 || month > 12) return false
  const year = 2000 + Number(match[2])
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth() + 1
  return year > currentYear || (year === currentYear && month >= currentMonth)
}

export type CardValidation =
  | { ok: true; brand: CardBrand; last4: string }
  | { ok: false; field: keyof CardInput; message: string }

export function validateCard(input: Partial<CardInput> | null | undefined, now: Date = new Date()): CardValidation {
  const number = typeof input?.number === 'string' ? input.number : ''
  const holder = typeof input?.holder === 'string' ? input.holder.trim() : ''
  const expiry = typeof input?.expiry === 'string' ? input.expiry : ''
  const cvc = typeof input?.cvc === 'string' ? input.cvc : ''

  const digits = digitsOnly(number)
  const brand = detectBrand(digits)
  if (digits.length < 13 || digits.length > 19 || (brand !== 'unknown' && digits.length !== maxDigits(brand))) {
    return { ok: false, field: 'number', message: 'El número de tarjeta no tiene la longitud correcta' }
  }
  if (!passesLuhn(digits)) {
    return { ok: false, field: 'number', message: 'El número de tarjeta no es válido' }
  }
  if (holder.length < 3 || holder.length > 60) {
    return { ok: false, field: 'holder', message: 'Escribe el nombre del titular como aparece en la tarjeta' }
  }
  if (!isExpiryInFuture(expiry, now)) {
    return { ok: false, field: 'expiry', message: 'La tarjeta está vencida o la fecha no es válida (MM/AA)' }
  }
  if (!/^\d{3,4}$/.test(cvc) || (brand === 'amex' && cvc.length !== 4)) {
    return { ok: false, field: 'cvc', message: 'El código de seguridad no es válido' }
  }
  return { ok: true, brand, last4: digits.slice(-4) }
}

/** Resultado simulado: tarjetas de prueba rechazadas; cualquier otra tarjeta válida se aprueba. */
export function simulateCardOutcome(number: string): DemoOutcome {
  switch (digitsOnly(number)) {
    case '4000000000000002':
      return { approved: false, code: 'insufficient_funds', reason: 'Fondos insuficientes' }
    case '4000000000009995':
      return { approved: false, code: 'bank_declined', reason: 'Tarjeta rechazada por el banco' }
    default:
      return { approved: true }
  }
}

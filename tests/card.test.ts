import { describe, expect, it } from 'vitest'
import {
  detectBrand,
  formatCardNumber,
  formatExpiry,
  isExpiryInFuture,
  passesLuhn,
  simulateCardOutcome,
  validateCard,
} from '@/lib/payments/card'

const NOW = new Date(Date.UTC(2026, 9, 20))
const valid = { number: '4242 4242 4242 4242', holder: 'Ana Pérez', expiry: '12/30', cvc: '123' }

describe('card helpers', () => {
  it('detects the brand by prefix', () => {
    expect(detectBrand('4242')).toBe('visa')
    expect(detectBrand('5254 1336')).toBe('mastercard')
    expect(detectBrand('2221 0000')).toBe('mastercard')
    expect(detectBrand('3714 4963')).toBe('amex')
    expect(detectBrand('6011')).toBe('unknown')
  })

  it('formats number and expiry while typing', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
    expect(formatCardNumber('371449635398431')).toBe('3714 496353 98431')
    expect(formatCardNumber('42424242424242429999')).toBe('4242 4242 4242 4242')
    expect(formatExpiry('1')).toBe('1')
    expect(formatExpiry('1228')).toBe('12/28')
  })

  it('applies the Luhn check', () => {
    expect(passesLuhn('4242424242424242')).toBe(true)
    expect(passesLuhn('4242424242424241')).toBe(false)
    expect(passesLuhn('12')).toBe(false)
  })

  it('accepts the current month and rejects past or malformed expiries', () => {
    expect(isExpiryInFuture('10/26', NOW)).toBe(true)
    expect(isExpiryInFuture('09/26', NOW)).toBe(false)
    expect(isExpiryInFuture('12/25', NOW)).toBe(false)
    expect(isExpiryInFuture('13/30', NOW)).toBe(false)
    expect(isExpiryInFuture('1230', NOW)).toBe(false)
  })
})

describe('validateCard', () => {
  it('accepts a valid card and exposes only brand and last 4', () => {
    expect(validateCard(valid, NOW)).toEqual({ ok: true, brand: 'visa', last4: '4242' })
  })

  it.each([
    [{ number: '4242 4242 4242 4241' }, 'number'],
    [{ number: '4242 4242' }, 'number'],
    [{ holder: ' ' }, 'holder'],
    [{ expiry: '01/20' }, 'expiry'],
    [{ cvc: '12' }, 'cvc'],
    [{ cvc: 'abc' }, 'cvc'],
  ])('rejects %j', (override, field) => {
    const result = validateCard({ ...valid, ...override }, NOW)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.field).toBe(field)
  })

  it('requires a 4 digit CVC for Amex', () => {
    const amex = { ...valid, number: '3714 496353 98431' }
    expect(validateCard({ ...amex, cvc: '123' }, NOW).ok).toBe(false)
    expect(validateCard({ ...amex, cvc: '1234' }, NOW).ok).toBe(true)
  })

  it('does not throw on missing input', () => {
    expect(validateCard(null, NOW).ok).toBe(false)
  })
})

describe('simulateCardOutcome', () => {
  it('declines the documented test cards with a reason', () => {
    expect(simulateCardOutcome('4000 0000 0000 0002')).toMatchObject({ approved: false, reason: 'Fondos insuficientes' })
    expect(simulateCardOutcome('4000000000009995')).toMatchObject({
      approved: false,
      reason: 'Tarjeta rechazada por el banco',
    })
  })

  it('approves 4242 and any other valid number', () => {
    expect(simulateCardOutcome('4242 4242 4242 4242')).toEqual({ approved: true })
    expect(simulateCardOutcome('5254 1336 7440 3564')).toEqual({ approved: true })
  })
})

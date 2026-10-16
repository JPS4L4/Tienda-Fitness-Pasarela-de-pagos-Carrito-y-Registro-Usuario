import { describe, expect, it } from 'vitest'
import { applyDiscount, formatPrice, toMinorUnits } from '@/lib/money'

// Intl usa espacios no separables (U+00A0) entre el símbolo y el número.
const normalize = (value: string) => value.replace(/\s/g, ' ')

describe('formatPrice', () => {
  it('formats COP without decimals using es-CO separators', () => {
    expect(normalize(formatPrice(129900))).toBe('$ 129.900')
  })

  it('formats millions with thousands separators', () => {
    expect(normalize(formatPrice(1000000))).toBe('$ 1.000.000')
  })

  it('falls back to zero for null, undefined and NaN', () => {
    expect(normalize(formatPrice(null))).toBe('$ 0')
    expect(normalize(formatPrice(undefined))).toBe('$ 0')
    expect(normalize(formatPrice(Number.NaN))).toBe('$ 0')
  })

  it('keeps up to two decimals for non-COP currencies', () => {
    expect(formatPrice(10.5, 'USD')).toContain('10,5')
  })
})

describe('applyDiscount', () => {
  it('returns the list price when there is no discount', () => {
    expect(applyDiscount(129900)).toBe(129900)
    expect(applyDiscount(129900, null)).toBe(129900)
    expect(applyDiscount(129900, 0)).toBe(129900)
  })

  it('applies a percentage and rounds to the nearest 100 COP', () => {
    expect(applyDiscount(100000, 10)).toBe(90000)
    // 129900 * 0.85 = 110415 -> 110400
    expect(applyDiscount(129900, 15)).toBe(110400)
  })

  it('returns zero for a 100% discount', () => {
    expect(applyDiscount(50000, 100)).toBe(0)
  })
})

describe('toMinorUnits', () => {
  it('multiplies by 100 as Stripe expects for COP', () => {
    expect(toMinorUnits(129900)).toBe(12990000)
  })

  it('rounds floating point noise to an integer', () => {
    expect(toMinorUnits(10.1)).toBe(1010)
    expect(Number.isInteger(toMinorUnits(0.1 + 0.2))).toBe(true)
  })
})

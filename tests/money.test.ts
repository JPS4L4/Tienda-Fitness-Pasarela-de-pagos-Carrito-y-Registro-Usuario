import { describe, expect, it } from 'vitest'
import { applyDiscount, formatPrice, getPriceDisplay, PRICE_UNAVAILABLE, toMinorUnits } from '@/lib/money'

// Intl usa espacios no separables (U+00A0) entre el símbolo y el número.
const normalize = (value: string) => value.replace(/\s/g, ' ')

describe('formatPrice', () => {
  it('formats COP without decimals using es-CO separators', () => {
    expect(normalize(formatPrice(129900))).toBe('$ 129.900')
  })

  it('formats millions with thousands separators', () => {
    expect(normalize(formatPrice(1000000))).toBe('$ 1.000.000')
  })

  it('never renders a zero price for null, undefined, NaN or Infinity', () => {
    expect(formatPrice(null)).toBe(PRICE_UNAVAILABLE)
    expect(formatPrice(undefined)).toBe(PRICE_UNAVAILABLE)
    expect(formatPrice(Number.NaN)).toBe(PRICE_UNAVAILABLE)
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe(PRICE_UNAVAILABLE)
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

  it('clamps the discount to 90% so the price never reaches zero', () => {
    expect(applyDiscount(50000, 100)).toBe(5000)
    expect(applyDiscount(50000, 150)).toBe(5000)
    expect(applyDiscount(50000, -20)).toBe(50000)
    expect(applyDiscount(50000, Number.NaN)).toBe(50000)
  })

  it('never returns less than 100 COP nor more than the list price', () => {
    expect(applyDiscount(100, 90)).toBe(100)
    expect(applyDiscount(300, 90)).toBe(100)
    expect(applyDiscount(129900, 1)).toBeLessThanOrEqual(129900)
  })
})

describe('getPriceDisplay', () => {
  it('flags invalid prices instead of showing zero', () => {
    for (const price of [0, -5, Number.NaN, null, undefined]) {
      expect(getPriceDisplay({ price })).toMatchObject({ valid: false, previous: null, badge: null })
    }
  })

  it('uses the stored discount: final price, struck list price and matching badge', () => {
    expect(getPriceDisplay({ price: 100000, discount: 20 })).toEqual({
      valid: true, final: 80000, previous: 100000, badge: 20,
    })
    // el descuento manda sobre originalPrice
    expect(getPriceDisplay({ price: 100000, discount: 20, originalPrice: 500000 }).previous).toBe(100000)
  })

  it('derives the badge from originalPrice when there is no discount', () => {
    expect(getPriceDisplay({ price: 75000, originalPrice: 100000 })).toEqual({
      valid: true, final: 75000, previous: 100000, badge: 25,
    })
    expect(getPriceDisplay({ price: 90000, originalPrice: 90000 })).toMatchObject({ previous: null, badge: null })
    expect(getPriceDisplay({ price: 90000, originalPrice: 50000 })).toMatchObject({ previous: null, badge: null })
  })

  it('treats out-of-range discounts the same way as applyDiscount', () => {
    expect(getPriceDisplay({ price: 50000, discount: 0 })).toMatchObject({ final: 50000, badge: null })
    expect(getPriceDisplay({ price: 50000, discount: 150 })).toMatchObject({ final: 5000, badge: 90 })
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

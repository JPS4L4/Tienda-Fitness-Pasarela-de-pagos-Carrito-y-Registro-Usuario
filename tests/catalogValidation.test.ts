import { describe, expect, it } from 'vitest'
import { validateCatalogMoney } from '@/lib/catalogValidation'

type Options = Parameters<typeof validateCatalogMoney>[1]

const ok = (input: object, options?: Options) => {
  const result = validateCatalogMoney(input, options)
  if (!result.ok) throw new Error(result.error)
  return result.value
}
const error = (input: object, options?: Options) => {
  const result = validateCatalogMoney(input, options)
  return result.ok ? null : result.error
}

describe('validateCatalogMoney (items)', () => {
  it('accepts a valid product and forces COP', () => {
    expect(ok({ price: 129900, discount: 15, originalPrice: 200000, stock: 10, installments: 6 })).toEqual({
      price: 129900, discount: 15, originalPrice: 200000, stock: 10, installments: 6, currency: 'COP',
    })
  })

  it('normalizes empty values and a zero discount to null', () => {
    const value = ok({ price: '50000', discount: 0, originalPrice: '', installments: null, stock: '' })
    expect(value).toMatchObject({ price: 50000, discount: null, originalPrice: null, installments: null, stock: 0 })
  })

  it.each([0, -1, 99, 1.5, Number.NaN, Infinity, 'abc', '', null, undefined, true])('rejects price %s', (price) => {
    expect(error({ price })).toMatch(/precio/i)
  })

  it.each([-1, 91, 100, 12.5, 'x'])('rejects discount %s', (discount) => {
    expect(error({ price: 50000, discount })).toMatch(/descuento/i)
  })

  it('requires originalPrice to be greater than price', () => {
    expect(error({ price: 50000, originalPrice: 50000 })).toMatch(/precio original/i)
    expect(error({ price: 50000, originalPrice: 40000 })).toMatch(/precio original/i)
    expect(error({ price: 50000, originalPrice: -3 })).toMatch(/precio original/i)
  })

  it.each([-1, 1.5, 'x'])('rejects stock %s', (stock) => {
    expect(error({ price: 50000, stock })).toMatch(/stock/i)
  })

  it.each([0, 49, 2.5])('rejects installments %s', (installments) => {
    expect(error({ price: 50000, installments })).toMatch(/cuotas/i)
  })

  it('rejects any currency other than COP', () => {
    expect(error({ price: 50000, currency: 'USD' })).toMatch(/COP/)
    expect(ok({ price: 50000, currency: 'COP' }).currency).toBe('COP')
  })
})

describe('validateCatalogMoney (partial updates and plans)', () => {
  it('only validates and returns the fields that were sent', () => {
    expect(ok({ stock: 3 }, { partial: true })).toEqual({ stock: 3 })
    expect(ok({}, { partial: true })).toEqual({})
    expect(error({ price: 0 }, { partial: true })).toMatch(/precio/i)
  })

  it('lets a partial update clear the discount', () => {
    expect(ok({ discount: null }, { partial: true })).toEqual({ discount: null })
  })

  it('plans validate price and discount and ignore item-only fields', () => {
    expect(ok({ price: 200000, discount: 10, stock: -5 }, { kind: 'plan' })).toEqual({
      price: 200000, discount: 10, currency: 'COP',
    })
    expect(error({ price: 200000, discount: 95 }, { kind: 'plan' })).toMatch(/descuento/i)
  })
})

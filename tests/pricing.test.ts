import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  item: { findMany: vi.fn() },
  plan: { findUnique: vi.fn() },
}))
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import { CheckoutError, priceCart, pricePlan } from '@/lib/orders/pricing'

describe('priceCart', () => {
  beforeEach(() => {
    prismaMock.item.findMany.mockReset()
  })

  it('prices lines from the database and ignores any client-sent price', async () => {
    prismaMock.item.findMany.mockResolvedValue([
      { id: 1, title: 'Mancuernas', price: 100000, discount: 10, stock: 5 },
    ])

    const { lines, total } = await priceCart([{ id: 1, quantity: 2, price: 1, discount: 99 }])

    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatchObject({ productId: 1, quantity: 2, price: 90000, originalPrice: 100000 })
    expect(total).toBe(180000)
  })

  it('groups duplicated product lines and queries each product once', async () => {
    prismaMock.item.findMany.mockResolvedValue([
      { id: 7, title: 'Banda', price: 20000, discount: null, stock: 10 },
    ])

    const { lines, total } = await priceCart([
      { productId: 7, quantity: 1 },
      { id: 7, quantity: 2 },
    ])

    expect(lines[0].quantity).toBe(3)
    expect(total).toBe(60000)
    expect(prismaMock.item.findMany.mock.calls[0][0].where.id.in).toEqual([7])
  })

  it.each([
    ['an empty cart', []],
    ['a non-array payload', 'x'],
    ['an invalid product id', [{ id: 'abc', quantity: 1 }]],
    ['a zero quantity', [{ id: 1, quantity: 0 }]],
    ['a fractional quantity', [{ id: 1, quantity: 1.5 }]],
    ['an excessive quantity', [{ id: 1, quantity: 100 }]],
  ])('rejects %s with a 400', async (_label, payload) => {
    await expect(priceCart(payload)).rejects.toMatchObject({ name: 'CheckoutError', status: 400 })
    expect(prismaMock.item.findMany).not.toHaveBeenCalled()
  })

  it('fails with 404 when a product no longer exists', async () => {
    prismaMock.item.findMany.mockResolvedValue([])
    await expect(priceCart([{ id: 9, quantity: 1 }])).rejects.toMatchObject({ status: 404 })
  })

  it('fails with 409 when stock is insufficient', async () => {
    prismaMock.item.findMany.mockResolvedValue([
      { id: 1, title: 'Mancuernas', price: 100000, discount: null, stock: 1 },
    ])
    const error = await priceCart([{ id: 1, quantity: 2 }]).catch((e) => e)
    expect(error).toBeInstanceOf(CheckoutError)
    expect(error.status).toBe(409)
  })
})

describe('pricePlan', () => {
  it('applies the plan discount from the database', async () => {
    prismaMock.plan.findUnique.mockResolvedValue({
      id: 2, title: 'Plan', price: 200000, discount: 25, currency: 'COP',
    })
    const { total } = await pricePlan('2')
    expect(total).toBe(150000)
  })

  it('rejects an invalid plan id and an unknown plan', async () => {
    await expect(pricePlan('x')).rejects.toMatchObject({ status: 400 })
    prismaMock.plan.findUnique.mockResolvedValue(null)
    await expect(pricePlan(5)).rejects.toMatchObject({ status: 404 })
  })
})

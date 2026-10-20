import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({ order: { findUnique: vi.fn() } }))
const fulfillMock = vi.hoisted(() => ({ fulfillOrder: vi.fn() }))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/orders/fulfillment', async () => {
  const actual = await vi.importActual<typeof import('@/lib/orders/fulfillment')>('@/lib/orders/fulfillment')
  return { StockError: actual.StockError, fulfillOrder: fulfillMock.fulfillOrder }
})

import { buildDemoPaymentId, confirmDemoPayment, demoLast4 } from '@/lib/orders/demoPayment'
import { StockError } from '@/lib/orders/fulfillment'
import { signGuestOrderToken } from '@/lib/orders/guestToken'

const card = { number: '4242 4242 4242 4242', holder: 'Ana Pérez', expiry: '12/40', cvc: '123' }
const pending = {
  id: 5, userId: 9, planId: null, status: 'PENDING', paymentMethod: 'DEMO', totalAmount: 99000,
  customerEmail: 'ana@example.com', customerFirstName: 'Ana', items: [{ title: 'Whey', quantity: 1, price: 99000 }],
}
const completed = { ...pending, status: 'COMPLETED', paymentId: 'demo_abcdef0123_4242' }

const run = (overrides: Record<string, unknown> = {}) =>
  confirmDemoPayment({ orderId: 5, card, guestToken: undefined, sessionUserId: 9, ...overrides })

describe('confirmDemoPayment', () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = 'test-secret-value'
    prismaMock.order.findUnique.mockReset().mockResolvedValue(pending)
    fulfillMock.fulfillOrder.mockReset().mockResolvedValue({ order: completed, alreadyFulfilled: false })
  })

  it('approves, fulfills with the DEMO method and returns only the last 4 digits and the emails', async () => {
    const result = await run()
    expect(result).toMatchObject({ status: 'approved', orderId: 5, last4: '4242', brand: 'visa' })
    expect(fulfillMock.fulfillOrder).toHaveBeenCalledWith(5, {
      method: 'DEMO',
      paymentId: expect.stringMatching(/^demo_[0-9a-f]{10}_4242$/),
    })
    if (result.status === 'approved') {
      expect(result.emails[0]).toMatchObject({ to: 'ana@example.com', kind: 'customer-confirmation' })
      expect(JSON.stringify(result)).not.toContain('4242 4242 4242 4242')
    }
  })

  it('declines the test card and leaves the order untouched for a retry', async () => {
    const result = await run({ card: { ...card, number: '4000 0000 0000 0002' } })
    expect(result).toMatchObject({ status: 'declined', reason: 'Fondos insuficientes' })
    expect(fulfillMock.fulfillOrder).not.toHaveBeenCalled()
  })

  it('rejects an invalid card before simulating any outcome', async () => {
    await expect(run({ card: { ...card, number: '4242 4242 4242 4241' } })).rejects.toMatchObject({ status: 400 })
    expect(fulfillMock.fulfillOrder).not.toHaveBeenCalled()
  })

  it('hides orders that belong to someone else', async () => {
    await expect(run({ sessionUserId: 77 })).rejects.toMatchObject({ status: 404 })
    await expect(run({ sessionUserId: null })).rejects.toMatchObject({ status: 404 })
  })

  it('hides missing orders and orders paid with a real gateway', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null)
    await expect(run()).rejects.toMatchObject({ status: 404 })
    prismaMock.order.findUnique.mockResolvedValue({ ...pending, paymentMethod: 'STRIPE' })
    await expect(run()).rejects.toMatchObject({ status: 404 })
  })

  it('lets a guest pay only with a valid token for that order', async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...pending, userId: null })
    await expect(run({ sessionUserId: null })).rejects.toMatchObject({ status: 404 })
    await expect(run({ sessionUserId: null, guestToken: signGuestOrderToken(6) })).rejects.toMatchObject({ status: 404 })
    await expect(run({ sessionUserId: null, guestToken: signGuestOrderToken(5) })).resolves.toMatchObject({
      status: 'approved',
    })
  })

  it('refuses orders that are no longer pending', async () => {
    prismaMock.order.findUnique.mockResolvedValue(completed)
    await expect(run()).rejects.toMatchObject({ status: 409 })
  })

  it('maps insufficient stock to a conflict', async () => {
    fulfillMock.fulfillOrder.mockRejectedValue(new StockError(1, 2))
    await expect(run()).rejects.toMatchObject({ status: 409 })
  })
})

describe('demo payment id', () => {
  it('round-trips the last 4 digits and ignores other methods', () => {
    expect(demoLast4(buildDemoPaymentId('0002'))).toBe('0002')
    expect(demoLast4('pi_123')).toBeNull()
    expect(demoLast4(null)).toBeNull()
  })
})

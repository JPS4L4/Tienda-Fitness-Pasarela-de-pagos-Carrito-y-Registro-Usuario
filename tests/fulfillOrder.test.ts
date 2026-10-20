import { beforeEach, describe, expect, it, vi } from 'vitest'

const tx = vi.hoisted(() => ({
  order: { updateMany: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
  userSubscription: { create: vi.fn() },
  item: { updateMany: vi.fn() },
}))
const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  item: { findUnique: vi.fn() },
  stockAlert: { create: vi.fn() },
  retryEvent: { create: vi.fn() },
  user: { findUnique: vi.fn() },
  plan: { findUnique: vi.fn() },
}))
const emailMock = vi.hoisted(() => ({ sendPlanInstructorEmail: vi.fn() }))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/emailService', () => emailMock)

import { StockError, fulfillOrder } from '@/lib/orders/fulfillment'

const payment = { method: 'STRIPE', paymentId: 'pi_123' } as const

const productOrder = {
  id: 1, planId: null, userId: 9, status: 'COMPLETED',
  items: [{ productId: 4, quantity: 2 }, { id: 5, quantity: 1 }],
}
const planOrder = { id: 2, planId: 3, userId: 9, status: 'COMPLETED', subscriptionType: null, items: [] }

describe('fulfillOrder', () => {
  beforeEach(() => {
    for (const group of [tx.order, tx.userSubscription, tx.item, prismaMock.item, prismaMock.stockAlert,
      prismaMock.retryEvent, prismaMock.user, prismaMock.plan]) {
      for (const fn of Object.values(group)) fn.mockReset()
    }
    emailMock.sendPlanInstructorEmail.mockReset().mockResolvedValue(true)
    prismaMock.$transaction.mockReset().mockImplementation(async (callback: (t: typeof tx) => unknown) => callback(tx))
    tx.item.updateMany.mockResolvedValue({ count: 1 })
  })

  it('never emails the instructor for a DEMO payment (no external API in demo mode)', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 1 })
    tx.order.findUniqueOrThrow.mockResolvedValue(planOrder)
    vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await fulfillOrder(2, { method: 'DEMO', paymentId: 'demo_abc_4242' })

    expect(emailMock.sendPlanInstructorEmail).not.toHaveBeenCalled()
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('claims a PENDING order once and decrements stock for each product line', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 1 })
    tx.order.findUniqueOrThrow.mockResolvedValue(productOrder)

    const result = await fulfillOrder(1, payment)

    expect(result.alreadyFulfilled).toBe(false)
    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { id: 1, status: 'PENDING' },
      data: { status: 'COMPLETED', paymentMethod: 'STRIPE', paymentId: 'pi_123' },
    })
    expect(tx.item.updateMany).toHaveBeenCalledTimes(2)
    expect(tx.item.updateMany).toHaveBeenCalledWith({
      where: { id: 4, stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    })
    expect(tx.item.updateMany).toHaveBeenCalledWith({
      where: { id: 5, stock: { gte: 1 } },
      data: { stock: { decrement: 1 } },
    })
  })

  it('is idempotent: a second call finds the order already processed and has no side effects', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 0 })
    tx.order.findUniqueOrThrow.mockResolvedValue(productOrder)

    const result = await fulfillOrder(1, payment)

    expect(result.alreadyFulfilled).toBe(true)
    expect(tx.item.updateMany).not.toHaveBeenCalled()
    expect(tx.userSubscription.create).not.toHaveBeenCalled()
    expect(emailMock.sendPlanInstructorEmail).not.toHaveBeenCalled()
  })

  it('only one of two concurrent confirmations applies the effects', async () => {
    tx.order.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 })
    tx.order.findUniqueOrThrow.mockResolvedValue(productOrder)

    const [first, second] = await Promise.all([fulfillOrder(1, payment), fulfillOrder(1, payment)])

    expect([first.alreadyFulfilled, second.alreadyFulfilled].sort()).toEqual([false, true])
    expect(tx.item.updateMany).toHaveBeenCalledTimes(2)
  })

  it('creates the subscription with a token and notifies the instructor for plan orders', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 1 })
    tx.order.findUniqueOrThrow.mockResolvedValue(planOrder)
    prismaMock.user.findUnique.mockResolvedValue({ name: 'Ana', email: 'ana@example.com', fitnessProfileData: null })
    prismaMock.plan.findUnique.mockResolvedValue({ title: 'Plan fuerza' })

    await fulfillOrder(2, payment)

    expect(tx.order.update).toHaveBeenCalledTimes(1)
    const subscription = tx.userSubscription.create.mock.calls[0][0].data
    expect(subscription).toMatchObject({ userId: 9, planId: 3, orderId: 2, status: 'active' })
    expect(subscription.accessToken).toMatch(/^[0-9a-f]{64}$/)
    expect(subscription.endDate.getTime()).toBeGreaterThan(Date.now())
    expect(tx.item.updateMany).not.toHaveBeenCalled()
    expect(emailMock.sendPlanInstructorEmail).toHaveBeenCalledWith(
      expect.objectContaining({ planTitle: 'Plan fuerza', userEmail: 'ana@example.com' }),
    )
  })

  it('does not undo a confirmed payment when the instructor email fails', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 1 })
    tx.order.findUniqueOrThrow.mockResolvedValue(planOrder)
    prismaMock.user.findUnique.mockResolvedValue({ name: 'Ana', email: 'ana@example.com' })
    prismaMock.plan.findUnique.mockResolvedValue({ title: 'Plan' })
    emailMock.sendPlanInstructorEmail.mockRejectedValue(new Error('smtp down'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(fulfillOrder(2, payment)).resolves.toMatchObject({ alreadyFulfilled: false })
  })

  it('throws StockError and records an alert when stock is insufficient', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 1 })
    tx.order.findUniqueOrThrow.mockResolvedValue(productOrder)
    tx.item.updateMany.mockResolvedValue({ count: 0 })
    prismaMock.item.findUnique.mockResolvedValue({ stock: 0 })

    await expect(fulfillOrder(1, payment)).rejects.toBeInstanceOf(StockError)

    expect(prismaMock.stockAlert.create).toHaveBeenCalledTimes(1)
    expect(prismaMock.stockAlert.create.mock.calls[0][0].data).toMatchObject({
      productId: 4, requestedQuantity: 2, paymentId: 'pi_123',
    })
    expect(prismaMock.retryEvent.create.mock.calls[0][0].data.reason).toBe('STOCK_INSUFFICIENT')
  })
})

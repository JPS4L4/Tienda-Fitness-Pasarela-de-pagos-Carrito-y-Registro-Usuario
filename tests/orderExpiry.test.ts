import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({ order: { updateMany: vi.fn() } }))
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import {
  PENDING_ORDER_TTL_MS,
  expireStalePendingOrders,
  isPendingOrderExpired,
  pendingOrderCutoff,
} from '@/lib/orders/expiry'

const now = new Date('2026-10-20T12:00:00.000Z')

describe('pending order expiry', () => {
  beforeEach(() => {
    prismaMock.order.updateMany.mockReset().mockResolvedValue({ count: 2 })
  })

  it('uses a 30 minute window from the injected clock', () => {
    expect(PENDING_ORDER_TTL_MS).toBe(30 * 60 * 1000)
    expect(pendingOrderCutoff(now).toISOString()).toBe('2026-10-20T11:30:00.000Z')
    expect(isPendingOrderExpired(new Date('2026-10-20T11:29:59.000Z'), now)).toBe(true)
    expect(isPendingOrderExpired(new Date('2026-10-20T11:30:00.000Z'), now)).toBe(false)
    expect(isPendingOrderExpired(new Date('2026-10-20T11:45:00.000Z'), now)).toBe(false)
  })

  it('cancels only stale PENDING demo orders with one idempotent updateMany', async () => {
    await expect(expireStalePendingOrders(now)).resolves.toBe(2)
    expect(prismaMock.order.updateMany).toHaveBeenCalledWith({
      where: {
        status: 'PENDING',
        paymentMethod: 'DEMO',
        createdAt: { lt: new Date('2026-10-20T11:30:00.000Z') },
      },
      data: { status: 'CANCELLED' },
    })
  })

  it('never throws: a failed cleanup returns 0', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    prismaMock.order.updateMany.mockRejectedValue(new Error('db down'))
    await expect(expireStalePendingOrders(now)).resolves.toBe(0)
  })
})

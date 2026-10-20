import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  plan: { findUnique: vi.fn() },
  order: { create: vi.fn(), updateMany: vi.fn() },
}))
const authMock = vi.hoisted(() => vi.fn())
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/nextAuth', () => ({ auth: authMock }))

import { validatePlanDuration } from '@/lib/catalogValidation'
import { durationName, durationSuffix, normalizeDuration } from '@/lib/planDuration'
import { prepareCheckout } from '@/lib/orders/checkout'
import { calculateExpirationDate } from '@/lib/tokenService'

describe('plan duration helpers', () => {
  it('labels every duration for the plan card', () => {
    expect(durationSuffix('monthly')).toBe('/ mes')
    expect(durationSuffix('quarterly')).toBe('/ trimestre')
    expect(durationSuffix('yearly')).toBe('/ año')
    expect(durationSuffix('lifetime')).toBe('pago único')
    expect(durationName('lifetime')).toBe('Pago único')
  })

  it('falls back to monthly for unknown or missing values', () => {
    expect(normalizeDuration('weekly')).toBe('monthly')
    expect(normalizeDuration(undefined)).toBe('monthly')
    expect(durationSuffix(null)).toBe('/ mes')
  })

  it('every supported duration is understood by calculateExpirationDate', () => {
    const base = Date.now()
    expect(calculateExpirationDate('quarterly').getTime()).toBeGreaterThan(calculateExpirationDate('monthly').getTime())
    expect(calculateExpirationDate('yearly').getTime()).toBeGreaterThan(calculateExpirationDate('quarterly').getTime())
    expect(calculateExpirationDate('lifetime').getTime()).toBeGreaterThan(base + 50 * 365 * 24 * 3600 * 1000)
  })
})

describe('validatePlanDuration', () => {
  it('accepts the four valid values', () => {
    for (const value of ['monthly', 'quarterly', 'yearly', 'lifetime']) {
      expect(validatePlanDuration(value)).toEqual({ ok: true, value })
    }
  })

  it('defaults to monthly on create and is omitted on partial updates', () => {
    expect(validatePlanDuration(undefined)).toEqual({ ok: true, value: 'monthly' })
    expect(validatePlanDuration(undefined, { partial: true })).toEqual({ ok: true, value: undefined })
  })

  it('rejects unknown values', () => {
    expect(validatePlanDuration('weekly').ok).toBe(false)
    expect(validatePlanDuration(12).ok).toBe(false)
  })
})

describe('prepareCheckout uses the plan duration', () => {
  beforeEach(() => {
    authMock.mockReset().mockResolvedValue({ user: { id: '9', email: 'ana@example.com' } })
    prismaMock.user.findUnique.mockReset().mockResolvedValue({ fitnessProfileCompleted: true, email: 'ana@example.com' })
    prismaMock.order.create.mockReset().mockResolvedValue({ id: 42 })
    prismaMock.order.updateMany.mockReset().mockResolvedValue({ count: 0 })
  })

  it.each(['monthly', 'quarterly', 'yearly', 'lifetime'])('stores %s on the PENDING order', async (durationType) => {
    prismaMock.plan.findUnique.mockResolvedValue({
      id: 3, title: 'Plan', price: 60000, discount: null, currency: 'COP', durationType,
    })
    await prepareCheckout({ type: 'plan', planId: 3 }, 'DEMO')
    expect(prismaMock.order.create.mock.calls[0][0].data.subscriptionType).toBe(durationType)
  })

  it('normalizes an invalid stored duration to monthly', async () => {
    prismaMock.plan.findUnique.mockResolvedValue({
      id: 3, title: 'Plan', price: 60000, discount: null, currency: 'COP', durationType: 'weird',
    })
    await prepareCheckout({ type: 'plan', planId: 3 }, 'DEMO')
    expect(prismaMock.order.create.mock.calls[0][0].data.subscriptionType).toBe('monthly')
  })
})

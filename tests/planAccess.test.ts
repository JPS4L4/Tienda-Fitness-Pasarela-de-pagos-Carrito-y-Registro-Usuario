import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Session } from 'next-auth'

const prismaMock = vi.hoisted(() => ({ userSubscription: { findFirst: vi.fn() } }))
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import { canViewPlanContent } from '@/lib/planAccess'

const session = (id: string, email: string) =>
  ({ user: { id, email, name: 'T' }, expires: '2999-01-01' }) as Session

describe('canViewPlanContent', () => {
  beforeEach(() => {
    prismaMock.userSubscription.findFirst.mockReset()
    vi.stubEnv('ADMIN_EMAILS', 'admin@example.com')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('denies anonymous visitors without querying the database', async () => {
    expect(await canViewPlanContent(null, 1)).toBe(false)
    expect(prismaMock.userSubscription.findFirst).not.toHaveBeenCalled()
  })

  it('allows admins without needing a subscription', async () => {
    expect(await canViewPlanContent(session('1', 'admin@example.com'), 3)).toBe(true)
    expect(prismaMock.userSubscription.findFirst).not.toHaveBeenCalled()
  })

  it('allows a user with an active, unexpired subscription to that plan', async () => {
    prismaMock.userSubscription.findFirst.mockResolvedValue({ id: 10 })
    expect(await canViewPlanContent(session('5', 'ana@example.com'), 3)).toBe(true)
    const where = prismaMock.userSubscription.findFirst.mock.calls[0][0].where
    expect(where).toMatchObject({ userId: 5, planId: 3, status: 'active' })
    expect(where.endDate.gt).toBeInstanceOf(Date)
  })

  it('denies a user without a matching subscription', async () => {
    prismaMock.userSubscription.findFirst.mockResolvedValue(null)
    expect(await canViewPlanContent(session('5', 'ana@example.com'), 3)).toBe(false)
  })

  it('denies when the session id is not numeric', async () => {
    expect(await canViewPlanContent(session('abc', 'ana@example.com'), 3)).toBe(false)
    expect(prismaMock.userSubscription.findFirst).not.toHaveBeenCalled()
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => vi.fn())
const prismaMock = vi.hoisted(() => ({ user: { findUnique: vi.fn() } }))

vi.mock('@/lib/nextAuth', () => ({ auth: authMock }))
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import { requireAdmin, getAdminSession } from '@/lib/requireAdmin'
import { isVerifiedAdmin } from '@/lib/adminAccess'
import { DEMO_ADMIN_EMAIL, READONLY_ADMIN_MESSAGE, isReadOnlyAdminEmail } from '@/lib/adminAuth'

const asUser = (email: string | null, emailVerified: Date | null = new Date()) => {
  authMock.mockResolvedValue(email ? { user: { email } } : null)
  prismaMock.user.findUnique.mockResolvedValue({ emailVerified })
}

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_EMAILS', `${DEMO_ADMIN_EMAIL}, boss@example.com`)
    authMock.mockReset()
    prismaMock.user.findUnique.mockReset()
  })
  afterEach(() => vi.unstubAllEnvs())

  it('401 without a session', async () => {
    asUser(null)
    expect((await requireAdmin())?.status).toBe(401)
  })

  it('403 when the email is not in ADMIN_EMAILS', async () => {
    asUser('intruso@example.com')
    expect((await requireAdmin())?.status).toBe(403)
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('403 for an admin email whose address is not verified', async () => {
    asUser('boss@example.com', null)
    expect((await requireAdmin())?.status).toBe(403)
    expect(await getAdminSession()).toBeNull()
  })

  it('403 when the admin user does not exist in the database', async () => {
    authMock.mockResolvedValue({ user: { email: 'boss@example.com' } })
    prismaMock.user.findUnique.mockResolvedValue(null)
    expect(await isVerifiedAdmin('boss@example.com')).toBe(false)
  })

  it('lets a verified admin read and write', async () => {
    asUser('boss@example.com')
    expect(await requireAdmin()).toBeNull()
    expect(await requireAdmin({ write: true })).toBeNull()
  })

  it('demo admin can read but every write answers 403 with the read-only message', async () => {
    asUser(DEMO_ADMIN_EMAIL)
    expect(await requireAdmin()).toBeNull()
    const denied = await requireAdmin({ write: true })
    expect(denied?.status).toBe(403)
    expect(await denied?.json()).toEqual({ error: READONLY_ADMIN_MESSAGE })
    expect(READONLY_ADMIN_MESSAGE).toBe('La cuenta demo de administración es de solo lectura')
  })

  it('DEMO_READONLY_ADMIN_EMAILS adds more read-only accounts', () => {
    vi.stubEnv('DEMO_READONLY_ADMIN_EMAILS', ' Visita@Example.com ')
    expect(isReadOnlyAdminEmail('visita@example.com')).toBe(true)
    expect(isReadOnlyAdminEmail(DEMO_ADMIN_EMAIL)).toBe(true)
    expect(isReadOnlyAdminEmail('boss@example.com')).toBe(false)
    expect(isReadOnlyAdminEmail(null)).toBe(false)
  })
})

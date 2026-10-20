import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({ auth: vi.fn() }))
const prismaMock = vi.hoisted(() => ({ order: { findFirst: vi.fn() } }))

vi.mock('@/lib/nextAuth', () => authMock)
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import { GET } from '@/app/api/orders/lookup/route'
import { canViewOrder, toOrderView } from '@/lib/orders/lookup'
import { signGuestOrderToken } from '@/lib/orders/guestToken'

const PAID_AT = new Date(Date.UTC(2026, 9, 20, 12, 0, 0))
const baseOrder = {
  id: 10, userId: null as number | null, planId: null, status: 'COMPLETED', paymentMethod: 'DEMO',
  paymentId: 'demo_0a1b2c3d4e_4242', customerEmail: 'ana@example.com', customerFirstName: 'Ana',
  totalAmount: 99000, items: [{ title: 'Whey', quantity: 1, price: 99000 }], shippingAddress: 'Calle 1',
  shippingCity: 'Bogotá', updatedAt: PAID_AT, tokenExpiresAt: null,
}

const request = (query: string) => new Request(`http://localhost/api/orders/lookup?${query}`)

describe('canViewOrder', () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = 'test-secret-value'
  })

  it('lets the owner and admins in, and nobody else', () => {
    const owned = { id: 10, userId: 3 }
    expect(canViewOrder(owned, { userId: 3, isAdmin: false })).toBe(true)
    expect(canViewOrder(owned, { userId: 4, isAdmin: false })).toBe(false)
    expect(canViewOrder(owned, { userId: null, isAdmin: false })).toBe(false)
    expect(canViewOrder(owned, { userId: 4, isAdmin: true })).toBe(true)
  })

  it('accepts the guest token only for that guest order', () => {
    const guest = { id: 10, userId: null }
    const viewer = { userId: null, isAdmin: false }
    expect(canViewOrder(guest, viewer, signGuestOrderToken(10))).toBe(true)
    expect(canViewOrder(guest, viewer, signGuestOrderToken(11))).toBe(false)
    expect(canViewOrder(guest, viewer, 'garbage')).toBe(false)
    expect(canViewOrder(guest, viewer, null)).toBe(false)
  })

  it('never accepts a guest token for an order that has an owner', () => {
    expect(canViewOrder({ id: 10, userId: 3 }, { userId: null, isAdmin: false }, signGuestOrderToken(10))).toBe(false)
  })
})

describe('toOrderView', () => {
  it('adds status label, payment label, shipping and the simulated confirmation email', () => {
    const view = toOrderView(baseOrder, new Date(PAID_AT.getTime() + 60 * 60_000))
    expect(view.statusLabel).toBe('Pago aprobado')
    expect(view.paymentLabel).toBe('Tarjeta demo •••• 4242')
    expect(view.paymentLast4).toBe('4242')
    expect(view.fulfillment?.kind).toBe('shipping')
    expect(view.emails).toHaveLength(1)
    expect(view.emails[0].body).toContain('FX')
  })

  it('has no tracking or email for a pending order', () => {
    const view = toOrderView({ ...baseOrder, status: 'PENDING', paymentId: null })
    expect(view.statusLabel).toBe('Pago pendiente')
    expect(view.fulfillment).toBeNull()
    expect(view.emails).toEqual([])
  })
})

describe('GET /api/orders/lookup', () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = 'test-secret-value'
    authMock.auth.mockReset().mockResolvedValue(null)
    prismaMock.order.findFirst.mockReset().mockResolvedValue(baseOrder)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('returns a guest order with a valid token', async () => {
    const response = await GET(request(`orderId=10&t=${encodeURIComponent(signGuestOrderToken(10))}`))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({ id: 10, statusLabel: 'Pago aprobado', paymentLast4: '4242' })
    expect(body.accessToken).toBeUndefined()
  })

  it('rejects guests without a token (401) and with a wrong or tampered token (404)', async () => {
    expect((await GET(request('orderId=10'))).status).toBe(401)
    expect((await GET(request(`orderId=10&t=${encodeURIComponent(signGuestOrderToken(11))}`))).status).toBe(404)
    const tampered = signGuestOrderToken(10).replace(/.$/, (c) => (c === 'A' ? 'B' : 'A'))
    expect((await GET(request(`orderId=10&t=${encodeURIComponent(tampered)}`))).status).toBe(404)
  })

  it('does not accept a token when looking up by paymentId', async () => {
    const token = encodeURIComponent(signGuestOrderToken(10))
    expect((await GET(request(`paymentId=demo_0a1b2c3d4e_4242&t=${token}`))).status).toBe(401)
  })

  it('hides someone else\'s order from a logged-in user', async () => {
    prismaMock.order.findFirst.mockResolvedValue({ ...baseOrder, userId: 3 })
    authMock.auth.mockResolvedValue({ user: { id: '4', email: 'other@example.com' } })
    expect((await GET(request('orderId=10'))).status).toBe(404)
    authMock.auth.mockResolvedValue({ user: { id: '3', email: 'owner@example.com' } })
    expect((await GET(request('orderId=10'))).status).toBe(200)
  })

  it('returns 404 for a missing order', async () => {
    prismaMock.order.findFirst.mockResolvedValue(null)
    authMock.auth.mockResolvedValue({ user: { id: '3', email: 'owner@example.com' } })
    expect((await GET(request('orderId=999'))).status).toBe(404)
  })
})

import crypto from 'node:crypto'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  order: { findFirst: vi.fn() },
  retryEvent: { create: vi.fn() },
}))
const fulfillMock = vi.hoisted(() => ({ fulfillOrder: vi.fn() }))
const mpMock = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/orders/fulfillment', async () => {
  const actual = await vi.importActual<typeof import('@/lib/orders/fulfillment')>('@/lib/orders/fulfillment')
  return { StockError: actual.StockError, fulfillOrder: fulfillMock.fulfillOrder }
})
vi.mock('mercadopago', () => ({
  MercadoPagoConfig: class {},
  Payment: class {
    get = mpMock.get
  },
}))

import { POST as stripeWebhook } from '@/app/api/payments/stripe/webhook/route'
import { POST as mercadopagoWebhook } from '@/app/api/payments/mercadopago/webhook/route'

const STRIPE_SECRET = 'sk_test_dummy'
const STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
const MP_WEBHOOK_SECRET = 'mp_webhook_secret'

function stripeRequest(payload: object, signature?: string | null) {
  const body = JSON.stringify(payload)
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (signature !== null) {
    headers['stripe-signature'] =
      signature ?? new Stripe(STRIPE_SECRET).webhooks.generateTestHeaderString({ payload: body, secret: STRIPE_WEBHOOK_SECRET })
  }
  return new NextRequest('http://localhost/api/payments/stripe/webhook', { method: 'POST', body, headers })
}

const succeededEvent = (amount = 12990000, currency = 'cop') => ({
  id: 'evt_1',
  object: 'event',
  type: 'payment_intent.succeeded',
  data: { object: { id: 'pi_1', object: 'payment_intent', amount, currency } },
})

describe('Stripe webhook', () => {
  beforeEach(() => {
    vi.stubEnv('PAYMENT_MODE', 'live')
    vi.stubEnv('STRIPE_SECRET_KEY', STRIPE_SECRET)
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', STRIPE_WEBHOOK_SECRET)
    prismaMock.order.findFirst.mockReset()
    fulfillMock.fulfillOrder.mockReset().mockResolvedValue({ alreadyFulfilled: false })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('answers 503 and processes nothing when the webhook secret is not configured', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '')
    const response = await stripeWebhook(stripeRequest(succeededEvent()))
    expect(response.status).toBe(503)
    expect(fulfillMock.fulfillOrder).not.toHaveBeenCalled()
  })

  it('rejects a request without the stripe-signature header', async () => {
    const response = await stripeWebhook(stripeRequest(succeededEvent(), null))
    expect(response.status).toBe(400)
    expect(fulfillMock.fulfillOrder).not.toHaveBeenCalled()
  })

  it('rejects an invalid signature', async () => {
    const response = await stripeWebhook(stripeRequest(succeededEvent(), 't=1,v1=deadbeef'))
    expect(response.status).toBe(400)
    expect(fulfillMock.fulfillOrder).not.toHaveBeenCalled()
  })

  it('fulfills the order for a correctly signed payment_intent.succeeded', async () => {
    prismaMock.order.findFirst.mockResolvedValue({ id: 7, totalAmount: 129900 })
    const response = await stripeWebhook(stripeRequest(succeededEvent()))
    expect(response.status).toBe(200)
    expect(fulfillMock.fulfillOrder).toHaveBeenCalledWith(7, { method: 'STRIPE', paymentId: 'pi_1' })
  })

  it('does not fulfill when the paid amount differs from the order total', async () => {
    prismaMock.order.findFirst.mockResolvedValue({ id: 7, totalAmount: 129900 })
    const response = await stripeWebhook(stripeRequest(succeededEvent(100)))
    expect(response.status).toBe(200)
    expect(fulfillMock.fulfillOrder).not.toHaveBeenCalled()
  })

  it('ignores event types other than payment_intent.succeeded', async () => {
    const response = await stripeWebhook(stripeRequest({ ...succeededEvent(), type: 'charge.refunded' }))
    expect(response.status).toBe(200)
    expect(prismaMock.order.findFirst).not.toHaveBeenCalled()
  })
})

function mpRequest(options: { secret?: boolean; tamper?: boolean } = {}) {
  const dataId = '555'
  const ts = '1700000000'
  const requestId = 'req-1'
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const v1 = crypto.createHmac('sha256', MP_WEBHOOK_SECRET).update(manifest).digest('hex')
  const headers: Record<string, string> = { 'content-type': 'application/json', 'x-request-id': requestId }
  if (options.secret !== false) headers['x-signature'] = `ts=${ts},v1=${options.tamper ? 'a'.repeat(64) : v1}`
  return new NextRequest(`http://localhost/api/payments/mercadopago/webhook?data.id=${dataId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type: 'payment', data: { id: dataId } }),
  })
}

describe('MercadoPago webhook', () => {
  beforeEach(() => {
    vi.stubEnv('PAYMENT_MODE', 'live')
    vi.stubEnv('MERCADOPAGO_ACCESS_TOKEN', 'TEST-token')
    vi.stubEnv('MERCADOPAGO_WEBHOOK_SECRET', MP_WEBHOOK_SECRET)
    prismaMock.order.findFirst.mockReset()
    prismaMock.retryEvent.create.mockReset().mockResolvedValue({})
    fulfillMock.fulfillOrder.mockReset().mockResolvedValue({ alreadyFulfilled: false })
    mpMock.get.mockReset().mockResolvedValue({
      status: 'approved', external_reference: '7', transaction_amount: 129900, currency_id: 'COP',
    })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rejects a missing x-signature header when the secret is configured', async () => {
    const response = await mercadopagoWebhook(mpRequest({ secret: false }))
    expect(response.status).toBe(401)
    expect(mpMock.get).not.toHaveBeenCalled()
  })

  it('rejects a tampered x-signature', async () => {
    const response = await mercadopagoWebhook(mpRequest({ tamper: true }))
    expect(response.status).toBe(401)
    expect(fulfillMock.fulfillOrder).not.toHaveBeenCalled()
  })

  it('fulfills the order for a valid signature and an approved, matching payment', async () => {
    prismaMock.order.findFirst.mockResolvedValue({ id: 7, totalAmount: 129900 })
    const response = await mercadopagoWebhook(mpRequest())
    expect(response.status).toBe(200)
    expect(mpMock.get).toHaveBeenCalledWith({ id: '555' })
    expect(fulfillMock.fulfillOrder).toHaveBeenCalledWith(7, { method: 'MERCADOPAGO', paymentId: '555' })
  })

  it('does not fulfill a payment that is not approved', async () => {
    mpMock.get.mockResolvedValue({ status: 'pending', external_reference: '7', transaction_amount: 129900 })
    const response = await mercadopagoWebhook(mpRequest())
    expect(response.status).toBe(200)
    expect(fulfillMock.fulfillOrder).not.toHaveBeenCalled()
  })

  it('does not fulfill when the paid amount differs from the order total', async () => {
    prismaMock.order.findFirst.mockResolvedValue({ id: 7, totalAmount: 500000 })
    const response = await mercadopagoWebhook(mpRequest())
    expect(response.status).toBe(200)
    expect(fulfillMock.fulfillOrder).not.toHaveBeenCalled()
  })

  it('answers 503 when the access token is not configured', async () => {
    vi.stubEnv('MERCADOPAGO_ACCESS_TOKEN', '')
    const response = await mercadopagoWebhook(mpRequest())
    expect(response.status).toBe(503)
  })
})

describe('demo mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('disables the real gateway webhooks without touching the database or any API', async () => {
    vi.stubEnv('PAYMENT_MODE', 'demo')
    vi.stubEnv('STRIPE_SECRET_KEY', STRIPE_SECRET)
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', STRIPE_WEBHOOK_SECRET)
    const stripeResponse = await stripeWebhook(stripeRequest(succeededEvent()))
    expect(stripeResponse.status).toBe(404)
    expect(prismaMock.order.findFirst).not.toHaveBeenCalled()
    expect(fulfillMock.fulfillOrder).not.toHaveBeenCalled()
  })
})

import { describe, expect, it } from 'vitest'
import {
  SHIPPING_STAGES,
  buildTrackingNumber,
  getOrderFulfillment,
  getPlanActivation,
  getShippingTracking,
} from '@/lib/orders/shipping'

const PAID_AT = new Date(Date.UTC(2026, 9, 20, 12, 0, 0))
const order = { id: 42, status: 'COMPLETED', planId: null, updatedAt: PAID_AT }
const at = (ms: number) => new Date(PAID_AT.getTime() + ms)
const MIN = 60_000
const HOUR = 60 * MIN

describe('getShippingTracking', () => {
  it.each([
    [0, 0, 'Pedido confirmado'],
    [2 * MIN - 1, 0, 'Pedido confirmado'],
    [2 * MIN, 1, 'Preparando'],
    [10 * MIN, 2, 'Despachado'],
    [30 * MIN, 3, 'En tránsito'],
    [2 * HOUR - 1, 3, 'En tránsito'],
    [2 * HOUR, 4, 'En reparto'],
    [6 * HOUR - 1, 4, 'En reparto'],
    [6 * HOUR, 5, 'Entregado'],
    [48 * HOUR, 5, 'Entregado'],
  ])('at +%i ms the current stage is %i (%s)', (elapsed, index, label) => {
    const tracking = getShippingTracking(order, at(elapsed))!
    expect(tracking.currentIndex).toBe(index)
    expect(tracking.stages[index].label).toBe(label)
    expect(tracking.stages.filter((stage) => stage.reached)).toHaveLength(index + 1)
    expect(tracking.delivered).toBe(index === SHIPPING_STAGES.length - 1)
  })

  it('is deterministic and derives dates from the payment time', () => {
    const first = getShippingTracking(order, at(HOUR))!
    expect(getShippingTracking(order, at(HOUR))).toEqual(first)
    expect(first.stages[1].at).toBe(at(2 * MIN).toISOString())
    expect(first.estimatedDelivery).toBe(at(6 * HOUR).toISOString())
    expect(first.carrier).toBe('Fitness Express')
  })

  it('has no tracking for pending, cancelled, refunded or plan orders', () => {
    for (const status of ['PENDING', 'CANCELLED', 'REFUNDED']) {
      expect(getShippingTracking({ ...order, status }, at(HOUR))).toBeNull()
    }
    expect(getShippingTracking({ ...order, planId: 3 }, at(HOUR))).toBeNull()
  })

  it('accepts ISO strings for updatedAt', () => {
    const tracking = getShippingTracking({ ...order, updatedAt: PAID_AT.toISOString() }, at(10 * MIN))!
    expect(tracking.currentIndex).toBe(2)
  })
})

describe('buildTrackingNumber', () => {
  it('is stable per order, distinct across orders and well formed', () => {
    expect(buildTrackingNumber(42)).toBe(buildTrackingNumber(42))
    expect(buildTrackingNumber(42)).not.toBe(buildTrackingNumber(43))
    expect(buildTrackingNumber(42)).toMatch(/^FX\d{9}CO$/)
  })
})

describe('plan activation', () => {
  const plan = { id: 7, status: 'COMPLETED', planId: 3, updatedAt: PAID_AT, tokenExpiresAt: at(30 * 24 * HOUR) }

  it('reports an active subscription until its end date', () => {
    expect(getPlanActivation(plan, at(HOUR))).toMatchObject({ active: true, activatedAt: PAID_AT.toISOString() })
    expect(getPlanActivation(plan, at(31 * 24 * HOUR))!.active).toBe(false)
  })

  it('does not apply to product orders or unpaid plans', () => {
    expect(getPlanActivation(order, at(HOUR))).toBeNull()
    expect(getPlanActivation({ ...plan, status: 'PENDING' }, at(HOUR))).toBeNull()
  })

  it('getOrderFulfillment picks shipping for products and activation for plans', () => {
    expect(getOrderFulfillment(order, at(HOUR))?.kind).toBe('shipping')
    expect(getOrderFulfillment(plan, at(HOUR))?.kind).toBe('activation')
    expect(getOrderFulfillment({ ...order, status: 'CANCELLED' }, at(HOUR))).toBeNull()
  })
})

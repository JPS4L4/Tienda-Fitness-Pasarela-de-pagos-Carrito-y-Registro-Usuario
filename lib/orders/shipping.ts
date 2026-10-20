// lib/orders/shipping.ts
// Envío simulado: no hay transportadora ni tabla de envíos. El seguimiento se DERIVA de la orden
// (id + momento del pago) y del reloj, sin escribir nada en la base de datos. Es determinista:
// la misma orden y el mismo instante producen siempre el mismo estado.
import { ORDER_STATUS } from './constants'

export const SIMULATED_CARRIER = 'Fitness Express'

const MINUTE = 60_000
const HOUR = 60 * MINUTE

export const SHIPPING_STAGES = [
  { key: 'confirmed', label: 'Pedido confirmado', detail: 'Recibimos tu pago', afterMs: 0 },
  { key: 'preparing', label: 'Preparando', detail: 'Estamos empacando tu pedido', afterMs: 2 * MINUTE },
  { key: 'dispatched', label: 'Despachado', detail: 'Tu pedido salió de la bodega', afterMs: 10 * MINUTE },
  { key: 'in_transit', label: 'En tránsito', detail: 'Va en camino a tu ciudad', afterMs: 30 * MINUTE },
  { key: 'out_for_delivery', label: 'En reparto', detail: 'El mensajero lleva tu pedido', afterMs: 2 * HOUR },
  { key: 'delivered', label: 'Entregado', detail: 'Pedido entregado', afterMs: 6 * HOUR },
] as const

export type ShippingStageKey = (typeof SHIPPING_STAGES)[number]['key']

/** Datos mínimos de la orden. `updatedAt` marca el pago: no hay otra fecha de completado. */
export type FulfillmentOrder = {
  id: number
  status: string
  planId: number | null
  updatedAt: Date | string
  tokenExpiresAt?: Date | string | null
}

export type ShippingStage = {
  key: ShippingStageKey
  label: string
  detail: string
  /** ISO: cuándo se alcanza (o se alcanzó) la etapa */
  at: string
  reached: boolean
}

export type ShippingTracking = {
  carrier: string
  trackingNumber: string
  stages: ShippingStage[]
  /** Índice de la última etapa alcanzada */
  currentIndex: number
  delivered: boolean
  /** ISO: entrega estimada (hora en que la etapa "Entregado" se alcanza) */
  estimatedDelivery: string
}

export type PlanActivation = {
  activatedAt: string
  /** ISO o null si el plan no vence */
  expiresAt: string | null
  active: boolean
}

export type OrderFulfillment =
  | { kind: 'shipping'; tracking: ShippingTracking }
  | { kind: 'activation'; activation: PlanActivation }

const toTime = (value: Date | string) => new Date(value).getTime()

/** Guía derivada del id de la orden (misma orden, misma guía). Ej.: FX482913057CO */
export function buildTrackingNumber(orderId: number): string {
  const hash = Math.imul(orderId ^ 0x9e3779b9, 2654435761) >>> 0
  return `FX${String(hash % 1_000_000_000).padStart(9, '0')}CO`
}

/** Seguimiento simulado de un pedido de productos pagado; null para planes y órdenes sin pago. */
export function getShippingTracking(order: FulfillmentOrder, now: Date = new Date()): ShippingTracking | null {
  if (order.status !== ORDER_STATUS.COMPLETED || order.planId) return null

  const paidAt = toTime(order.updatedAt)
  const elapsed = now.getTime() - paidAt
  const stages: ShippingStage[] = SHIPPING_STAGES.map((stage) => ({
    key: stage.key,
    label: stage.label,
    detail: stage.detail,
    at: new Date(paidAt + stage.afterMs).toISOString(),
    reached: elapsed >= stage.afterMs,
  }))
  const currentIndex = stages.reduce((last, stage, index) => (stage.reached ? index : last), 0)

  return {
    carrier: SIMULATED_CARRIER,
    trackingNumber: buildTrackingNumber(order.id),
    stages,
    currentIndex,
    delivered: currentIndex === stages.length - 1,
    estimatedDelivery: stages[stages.length - 1].at,
  }
}

/** Activación simulada de un plan pagado: acceso inmediato hasta el fin de la suscripción. */
export function getPlanActivation(order: FulfillmentOrder, now: Date = new Date()): PlanActivation | null {
  if (order.status !== ORDER_STATUS.COMPLETED || !order.planId) return null
  const expiresAt = order.tokenExpiresAt ? new Date(order.tokenExpiresAt) : null
  return {
    activatedAt: new Date(order.updatedAt).toISOString(),
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    active: !expiresAt || expiresAt.getTime() > now.getTime(),
  }
}

/** Lo que se muestra tras el pago: envío para productos, activación para planes; null si no aplica. */
export function getOrderFulfillment(order: FulfillmentOrder, now: Date = new Date()): OrderFulfillment | null {
  const tracking = getShippingTracking(order, now)
  if (tracking) return { kind: 'shipping', tracking }
  const activation = getPlanActivation(order, now)
  return activation ? { kind: 'activation', activation } : null
}

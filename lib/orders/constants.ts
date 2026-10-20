// lib/orders/constants.ts
// Única fuente de verdad para estados y métodos de pago (sin migración: son strings en la BD).

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const PAYMENT_METHOD = {
  STRIPE: 'STRIPE',
  MERCADOPAGO: 'MERCADOPAGO',
  /** Pago simulado (PAYMENT_MODE=demo): no usa ninguna pasarela externa. */
  DEMO: 'DEMO',
} as const
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const

/** Moneda única de la tienda (los montos se calculan y cobran en COP). */
export const CURRENCY = 'COP'

/** Duración de la suscripción de un plan (el modelo actual no guarda otra). */
export const DEFAULT_SUBSCRIPTION_TYPE = 'monthly'

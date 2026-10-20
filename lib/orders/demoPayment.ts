// lib/orders/demoPayment.ts
// Pago simulado (PAYMENT_MODE=demo): valida la tarjeta de prueba y, si se aprueba, reutiliza fulfillOrder
// para que stock y suscripciones sigan teniendo una única fuente de verdad. Sin pasarela ni correo reales.
import crypto from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { type CardBrand, simulateCardOutcome, validateCard } from '@/lib/payments/card'
import { CheckoutError } from './pricing'
import { ORDER_STATUS, PAYMENT_METHOD } from './constants'
import { StockError, fulfillOrder } from './fulfillment'
import { buildTrackingNumber } from './shipping'
import { verifyGuestOrderToken } from './guestToken'
import { type SimulatedEmail, buildOrderEmails } from './simulatedEmail'

export type DemoPaymentResult =
  | {
      status: 'approved'
      orderId: number
      last4: string
      brand: CardBrand
      paymentId: string
      message: string
      emails: SimulatedEmail[]
    }
  | { status: 'declined'; orderId: number; code: string; reason: string }

/** `demo_<aleatorio>_<últimos 4>`: permite mostrar "•••• 4242" en el comprobante sin guardar la tarjeta. */
export const buildDemoPaymentId = (last4: string) =>
  `demo_${crypto.randomBytes(5).toString('hex')}_${last4}`

export async function confirmDemoPayment(input: {
  orderId: unknown
  card: unknown
  guestToken: unknown
  sessionUserId: number | null
}): Promise<DemoPaymentResult> {
  const orderId = Number(input.orderId)
  if (!Number.isInteger(orderId) || orderId <= 0) throw new CheckoutError('Orden inválida')

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  // Misma respuesta para "no existe" y "no es tuya": no revela qué órdenes existen.
  const notFound = new CheckoutError('Orden no encontrada', 404)
  if (!order || order.paymentMethod !== PAYMENT_METHOD.DEMO) throw notFound

  const isOwner =
    order.userId !== null
      ? order.userId === input.sessionUserId
      : verifyGuestOrderToken(order.id, input.guestToken)
  if (!isOwner) throw notFound

  if (order.status !== ORDER_STATUS.PENDING) {
    throw new CheckoutError('Esta orden ya no está pendiente de pago', 409)
  }

  const cardInput = (input.card ?? {}) as Record<string, unknown>
  const card = {
    number: typeof cardInput.number === 'string' ? cardInput.number : '',
    holder: typeof cardInput.holder === 'string' ? cardInput.holder : '',
    expiry: typeof cardInput.expiry === 'string' ? cardInput.expiry : '',
    cvc: typeof cardInput.cvc === 'string' ? cardInput.cvc : '',
  }
  const validation = validateCard(card)
  if (!validation.ok) throw new CheckoutError(validation.message)

  const outcome = simulateCardOutcome(card.number)
  if (!outcome.approved) {
    // La orden sigue PENDING: el cliente puede reintentar con otra tarjeta.
    return { status: 'declined', orderId: order.id, code: outcome.code, reason: outcome.reason }
  }

  const paymentId = buildDemoPaymentId(validation.last4)
  let fulfilled
  try {
    fulfilled = await fulfillOrder(order.id, { method: PAYMENT_METHOD.DEMO, paymentId })
  } catch (error) {
    if (error instanceof StockError) {
      throw new CheckoutError('Stock insuficiente para uno o más productos', 409)
    }
    throw error
  }
  if (fulfilled.order.status !== ORDER_STATUS.COMPLETED) {
    throw new CheckoutError('La orden no está disponible', 409)
  }

  const done = fulfilled.order
  return {
    status: 'approved',
    orderId: done.id,
    last4: validation.last4,
    brand: validation.brand,
    paymentId: done.paymentId ?? paymentId,
    message: done.planId
      ? '¡Suscripción exitosa! Ya tienes acceso a tu plan.'
      : '¡Pago exitoso! Tu pedido ha sido confirmado.',
    emails: buildOrderEmails({ ...done, trackingNumber: done.planId ? null : buildTrackingNumber(done.id) }),
  }
}

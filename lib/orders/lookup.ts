// lib/orders/lookup.ts
// Quién puede ver una orden (voucher) y qué se le devuelve. Sin acceso => se responde como "no existe".
import { verifyGuestOrderToken } from './guestToken'
import { demoLast4, describePaymentMethod, getOrderStatusView } from './status'
import { buildTrackingNumber, getOrderFulfillment, type OrderFulfillment } from './shipping'
import { buildCustomerConfirmationEmail, type SimulatedEmail } from './simulatedEmail'
import { ORDER_STATUS, PAYMENT_METHOD } from './constants'

export type OrderViewer = { userId: number | null; isAdmin: boolean }

/**
 * - El dueño autenticado y los admins ven cualquier orden suya / todas.
 * - Una orden de invitado (userId null) la ve quien presente su token firmado.
 * - Nunca se acepta el token para una orden con dueño.
 */
export function canViewOrder(
  order: { id: number; userId: number | null },
  viewer: OrderViewer,
  guestToken?: string | null
): boolean {
  if (viewer.isAdmin) return true
  if (viewer.userId !== null && order.userId === viewer.userId) return true
  return order.userId === null && verifyGuestOrderToken(order.id, guestToken)
}

type ViewableOrder = {
  id: number
  status: string
  planId: number | null
  updatedAt: Date
  tokenExpiresAt: Date | null
  paymentMethod: string | null
  paymentId: string | null
  customerEmail: string
  customerFirstName: string | null
  totalAmount: number
  items: unknown
  shippingAddress: string | null
  shippingCity: string | null
}

export type OrderView<T extends ViewableOrder> = T & {
  statusLabel: string
  paymentLabel: string
  paymentLast4: string | null
  fulfillment: OrderFulfillment | null
  /** Correo de confirmación simulado (solo órdenes demo pagadas) */
  emails: SimulatedEmail[]
}

/** Orden + datos derivados que muestra el voucher (todo calculado, nada guardado). */
export function toOrderView<T extends ViewableOrder>(order: T, now: Date = new Date()): OrderView<T> {
  const paymentLast4 = demoLast4(order.paymentId)
  const paidWithDemo = order.status === ORDER_STATUS.COMPLETED && order.paymentMethod === PAYMENT_METHOD.DEMO
  return {
    ...order,
    statusLabel: getOrderStatusView(order.status).label,
    paymentLabel: describePaymentMethod(order.paymentMethod, paymentLast4),
    paymentLast4,
    fulfillment: getOrderFulfillment(order, now),
    emails: paidWithDemo
      ? [
          buildCustomerConfirmationEmail({
            ...order,
            trackingNumber: order.planId ? null : buildTrackingNumber(order.id),
          }),
        ]
      : [],
  }
}

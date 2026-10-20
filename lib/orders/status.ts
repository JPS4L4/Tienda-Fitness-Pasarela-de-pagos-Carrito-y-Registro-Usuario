// lib/orders/status.ts
// Cómo se nombra y se pinta cada estado de orden en la UI (única fuente para voucher, perfil y admin).
import { ORDER_STATUS } from './constants'

type StatusView = { label: string; badge: string; tone: 'ok' | 'warn' | 'danger' | 'muted' }

const VIEWS: Record<string, StatusView> = {
  [ORDER_STATUS.COMPLETED]: { label: 'Pago aprobado', badge: 'badge-ok', tone: 'ok' },
  [ORDER_STATUS.PENDING]: { label: 'Pago pendiente', badge: 'badge-warn', tone: 'warn' },
  [ORDER_STATUS.CANCELLED]: { label: 'Pedido cancelado', badge: 'badge-danger', tone: 'danger' },
  [ORDER_STATUS.REFUNDED]: { label: 'Reembolsado', badge: 'badge-outline', tone: 'muted' },
}

export function getOrderStatusView(status: string): StatusView {
  return VIEWS[status] ?? { label: status, badge: 'badge-outline', tone: 'muted' }
}

/** Nombre legible del método de pago guardado en la orden (con los 4 últimos dígitos en modo demo). */
export function describePaymentMethod(method: string | null | undefined, last4?: string | null): string {
  switch (method) {
    case 'DEMO':
      return last4 ? `Tarjeta demo •••• ${last4}` : 'Tarjeta demo (simulada)'
    case 'STRIPE':
      return 'Tarjeta (Stripe)'
    case 'MERCADOPAGO':
      return 'Mercado Pago'
    default:
      return '—'
  }
}

/** Últimos 4 dígitos guardados en el id de un pago demo (null para otros métodos). */
export function demoLast4(paymentId: string | null | undefined): string | null {
  const match = /^demo_[0-9a-f]+_(\d{4})$/.exec(paymentId ?? '')
  return match ? match[1] : null
}

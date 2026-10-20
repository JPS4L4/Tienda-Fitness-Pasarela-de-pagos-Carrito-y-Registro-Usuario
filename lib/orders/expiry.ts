// lib/orders/expiry.ts
// Expiración perezosa de órdenes PENDING abandonadas: cada checkout crea una orden PENDING y, si el
// cliente nunca paga, quedaría así para siempre. No hay cron: se limpian al preparar un checkout y al
// listar órdenes (admin, ventas, perfil).
//
// Solo se expiran las órdenes del pago simulado (DEMO): en modo "live", Stripe/Mercado Pago pueden
// confirmar un pago tarde (webhook, PSE, efectivo) y fulfillOrder solo completa órdenes PENDING.
import { prisma } from '@/lib/prisma'
import { ORDER_STATUS, PAYMENT_METHOD } from './constants'

export const PENDING_ORDER_TTL_MS = 30 * 60 * 1000

export const EXPIRED_ORDER_MESSAGE = 'La orden expiró, vuelve a intentarlo'

/** Fecha límite: las órdenes PENDING creadas antes de esta fecha están vencidas. */
export const pendingOrderCutoff = (now: Date = new Date()): Date =>
  new Date(now.getTime() - PENDING_ORDER_TTL_MS)

export const isPendingOrderExpired = (createdAt: Date, now: Date = new Date()): boolean =>
  createdAt.getTime() < pendingOrderCutoff(now).getTime()

/**
 * Marca como CANCELLED las órdenes PENDING (pago simulado) con más de 30 minutos. Idempotente
 * (updateMany filtrado por estado). Nunca lanza: una limpieza fallida no debe romper la página.
 * Devuelve cuántas órdenes se cancelaron.
 */
export async function expireStalePendingOrders(now: Date = new Date()): Promise<number> {
  try {
    const result = await prisma.order.updateMany({
      where: {
        status: ORDER_STATUS.PENDING,
        paymentMethod: PAYMENT_METHOD.DEMO,
        createdAt: { lt: pendingOrderCutoff(now) },
      },
      data: { status: ORDER_STATUS.CANCELLED },
    })
    return result.count
  } catch (error) {
    console.error('No se pudieron expirar las órdenes pendientes:', error)
    return 0
  }
}

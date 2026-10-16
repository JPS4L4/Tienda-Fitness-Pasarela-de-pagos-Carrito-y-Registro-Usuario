// lib/orders/checkout.ts
// Prepara el checkout (validación + precio de servidor + orden PENDING) para cualquier pasarela.
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { CheckoutError, priceCart, pricePlan, type PricedLine } from './pricing'
import { ORDER_STATUS, DEFAULT_SUBSCRIPTION_TYPE, type PaymentMethod } from './constants'

type ShippingInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
}

const SHIPPING_FIELDS: (keyof ShippingInfo)[] = [
  'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode',
]

function parseShipping(raw: unknown): ShippingInfo {
  const source = (raw ?? {}) as Record<string, unknown>
  const info = {} as ShippingInfo
  for (const field of SHIPPING_FIELDS) {
    const value = typeof source[field] === 'string' ? (source[field] as string).trim() : ''
    if (!value || value.length > 200) throw new CheckoutError('Completa los datos de envío')
    info[field] = value
  }
  if (!/^\S+@\S+\.\S+$/.test(info.email)) throw new CheckoutError('Email inválido')
  return info
}

export type PreparedCheckout = {
  orderId: number
  total: number
  userId: number | null
  type: 'cart' | 'plan'
  lines: PricedLine[]
  planTitle?: string
}

/**
 * Valida la petición, calcula el total desde la BD y crea la orden PENDING.
 * El cliente solo aporta: type, items [{id, quantity}] / planId y shippingInfo.
 */
export async function prepareCheckout(
  body: { type?: unknown; items?: unknown; planId?: unknown; shippingInfo?: unknown },
  method: PaymentMethod
): Promise<PreparedCheckout> {
  const session = await auth()
  const parsedUserId = session?.user?.id ? Number.parseInt(session.user.id, 10) : NaN
  const userId = Number.isInteger(parsedUserId) ? parsedUserId : null

  if (body.type === 'plan') {
    if (!userId) throw new CheckoutError('Debes iniciar sesión para comprar un plan', 401)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fitnessProfileCompleted: true, email: true },
    })
    if (!user?.fitnessProfileCompleted) {
      throw new CheckoutError('Completa tu perfil fitness antes de comprar un plan', 403)
    }

    const { plan, total } = await pricePlan(body.planId)
    const order = await prisma.order.create({
      data: {
        userId,
        planId: plan.id,
        customerEmail: user.email || session?.user?.email || '',
        totalAmount: total,
        status: ORDER_STATUS.PENDING,
        paymentMethod: method,
        subscriptionType: DEFAULT_SUBSCRIPTION_TYPE,
        items: [
          { type: 'plan', planId: plan.id, title: plan.title, price: total, currency: plan.currency },
        ] as Prisma.InputJsonValue,
      },
      select: { id: true },
    })
    return { orderId: order.id, total, userId, type: 'plan', lines: [], planTitle: plan.title }
  }

  if (body.type === 'cart') {
    const shipping = parseShipping(body.shippingInfo)
    const { lines, total } = await priceCart(body.items)
    const order = await prisma.order.create({
      data: {
        userId,
        customerFirstName: shipping.firstName,
        customerLastName: shipping.lastName,
        customerEmail: shipping.email,
        customerPhone: shipping.phone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingPostalCode: shipping.postalCode,
        totalAmount: total,
        status: ORDER_STATUS.PENDING,
        paymentMethod: method,
        items: lines as unknown as Prisma.InputJsonValue,
      },
      select: { id: true },
    })
    return { orderId: order.id, total, userId, type: 'cart', lines }
  }

  throw new CheckoutError('Tipo de orden inválido')
}

/** Marca como cancelada una orden PENDING cuya pasarela falló al crear el pago. */
export async function cancelPendingOrder(orderId: number) {
  await prisma.order.updateMany({
    where: { id: orderId, status: ORDER_STATUS.PENDING },
    data: { status: ORDER_STATUS.CANCELLED },
  })
}

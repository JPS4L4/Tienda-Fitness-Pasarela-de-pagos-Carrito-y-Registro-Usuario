// lib/orders/pricing.ts
// Los precios SIEMPRE se calculan aquí desde la BD; nunca se confía en montos del cliente.
import { prisma } from '@/lib/prisma'

export class CheckoutError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'CheckoutError'
    this.status = status
  }
}

export type PricedLine = {
  productId: number
  title: string
  quantity: number
  /** Precio unitario final (con descuento) */
  price: number
  originalPrice: number
  discount: number | null
}

/** Mismo cálculo que muestra el checkout: descuento porcentual redondeado. */
export const applyDiscount = (price: number, discount?: number | null) =>
  discount ? Math.round(price * (1 - discount / 100)) : price

const MAX_QUANTITY = 99

export async function priceCart(rawItems: unknown): Promise<{ lines: PricedLine[]; total: number }> {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new CheckoutError('El carrito está vacío')
  }

  // Solo se toman id y cantidad del cliente; se agrupan duplicados.
  const requested = new Map<number, number>()
  for (const raw of rawItems) {
    const productId = Number(raw?.productId ?? raw?.id)
    const quantity = Number(raw?.quantity)
    if (!Number.isInteger(productId) || productId <= 0) throw new CheckoutError('Producto inválido')
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > MAX_QUANTITY) {
      throw new CheckoutError('Cantidad inválida')
    }
    requested.set(productId, (requested.get(productId) ?? 0) + quantity)
  }

  const products = await prisma.item.findMany({
    where: { id: { in: [...requested.keys()] } },
    select: { id: true, title: true, price: true, discount: true, stock: true },
  })
  if (products.length !== requested.size) {
    throw new CheckoutError('Uno o más productos ya no están disponibles', 404)
  }

  const lines: PricedLine[] = products.map((product) => {
    const quantity = requested.get(product.id)!
    if (product.stock < quantity) {
      throw new CheckoutError(`Stock insuficiente para "${product.title}"`, 409)
    }
    return {
      productId: product.id,
      title: product.title,
      quantity,
      price: applyDiscount(product.price, product.discount),
      originalPrice: product.price,
      discount: product.discount,
    }
  })

  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  if (!(total > 0)) throw new CheckoutError('Monto inválido')
  return { lines, total }
}

export async function pricePlan(rawPlanId: unknown) {
  const planId = Number(rawPlanId)
  if (!Number.isInteger(planId) || planId <= 0) throw new CheckoutError('Plan inválido')

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    select: { id: true, title: true, price: true, discount: true, currency: true },
  })
  if (!plan) throw new CheckoutError('Plan no encontrado', 404)

  const total = applyDiscount(plan.price, plan.discount)
  if (!(total > 0)) throw new CheckoutError('Monto inválido')
  return { plan, total }
}

// lib/orders/fulfillment.ts
// Servicio compartido: confirmación de Stripe, webhook de Stripe y webhook de MercadoPago.
// Idempotente: solo la primera llamada que pasa la orden de PENDING a COMPLETED aplica efectos
// (stock, suscripción, correo). El UPDATE condicional hace de cerrojo, sin migración.
import { prisma } from '@/lib/prisma'
import { sendPlanInstructorEmail } from '@/lib/emailService'
import { generateAccessToken, calculateExpirationDate } from '@/lib/tokenService'
import {
  ORDER_STATUS,
  SUBSCRIPTION_STATUS,
  DEFAULT_SUBSCRIPTION_TYPE,
  type PaymentMethod,
} from './constants'

export class StockError extends Error {
  productId: number
  quantity: number
  constructor(productId: number, quantity: number) {
    super('STOCK_INSUFFICIENT')
    this.name = 'StockError'
    this.productId = productId
    this.quantity = quantity
  }
}

export async function fulfillOrder(
  orderId: number,
  payment: { method: PaymentMethod; paymentId: string }
) {
  let fulfilledNow = false as boolean

  try {
    const order = await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: orderId, status: ORDER_STATUS.PENDING },
        data: {
          status: ORDER_STATUS.COMPLETED,
          paymentMethod: payment.method,
          paymentId: payment.paymentId,
        },
      })
      const current = await tx.order.findUniqueOrThrow({ where: { id: orderId } })
      if (claimed.count === 0) return current // ya procesada (u orden cancelada)
      fulfilledNow = true

      if (current.planId) {
        if (!current.userId) throw new Error('PLAN_ORDER_WITHOUT_USER')
        const subscriptionType = current.subscriptionType || DEFAULT_SUBSCRIPTION_TYPE
        const accessToken = generateAccessToken()
        const endDate = calculateExpirationDate(subscriptionType)

        await tx.order.update({
          where: { id: current.id },
          data: { accessToken, tokenExpiresAt: endDate, subscriptionType },
        })
        await tx.userSubscription.create({
          data: {
            userId: current.userId,
            planId: current.planId,
            orderId: current.id,
            status: SUBSCRIPTION_STATUS.ACTIVE,
            startDate: new Date(),
            endDate,
            accessToken,
          },
        })
      } else {
        const lines = Array.isArray(current.items) ? (current.items as any[]) : []
        for (const line of lines) {
          const productId = Number(line?.productId ?? line?.id)
          const quantity = Number(line?.quantity || 0)
          if (!productId || quantity <= 0) continue

          const updated = await tx.item.updateMany({
            where: { id: productId, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
          })
          if (updated.count === 0) throw new StockError(productId, quantity)
        }
      }
      return current
    })

    if (fulfilledNow && order.planId && order.userId) {
      await notifyInstructor(order.userId, order.planId)
    }
    return { order, alreadyFulfilled: !fulfilledNow }
  } catch (error) {
    if (error instanceof StockError) {
      await recordStockProblem(payment, error)
    }
    throw error
  }
}

async function recordStockProblem(
  payment: { method: PaymentMethod; paymentId: string },
  error: StockError
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: error.productId },
      select: { stock: true },
    })
    await prisma.stockAlert.create({
      data: {
        productId: error.productId,
        requestedQuantity: error.quantity,
        availableStock: item?.stock ?? null,
        paymentProvider: payment.method,
        paymentId: payment.paymentId,
        context: 'fulfill-order',
      },
    })
    await prisma.retryEvent.create({
      data: {
        paymentProvider: payment.method,
        paymentId: payment.paymentId,
        reason: 'STOCK_INSUFFICIENT',
        context: `productId:${error.productId}`,
      },
    })
  } catch (logError) {
    console.error('No se pudo registrar la alerta de stock:', logError)
  }
}

async function notifyInstructor(userId: number, planId: number) {
  try {
    const [user, plan] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          fitnessProfileData: true,
          weightKg: true,
          heightCm: true,
          age: true,
          trainingTime: true,
          goal: true,
          equipmentAvailability: true,
          healthCondition: true,
        },
      }),
      prisma.plan.findUnique({ where: { id: planId }, select: { title: true } }),
    ])

    const fallbackProfileData = user
      ? {
          weightKg: user.weightKg ?? null,
          heightCm: user.heightCm ?? null,
          age: user.age ?? null,
          trainingTime: user.trainingTime ?? null,
          goal: user.goal ?? null,
          equipmentAvailability: user.equipmentAvailability ?? null,
          healthCondition: user.healthCondition ?? null,
        }
      : null

    await sendPlanInstructorEmail({
      userName: user?.name ?? null,
      userEmail: user?.email ?? null,
      planTitle: plan?.title || 'Plan',
      fitnessProfileData:
        (user?.fitnessProfileData as Record<string, unknown> | null) ?? fallbackProfileData,
    })
  } catch (error) {
    // El correo nunca debe deshacer un pago ya confirmado.
    console.error('Error notificando al instructor:', error)
  }
}

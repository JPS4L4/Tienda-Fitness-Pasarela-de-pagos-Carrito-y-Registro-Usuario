import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/nextAuth'

const getAdminEmails = () =>
  process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()).filter(Boolean) ?? []

const requireAdmin = async () => {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const adminEmails = getAdminEmails()
  if (adminEmails.length > 0 && !adminEmails.includes(session.user.email)) {
    return NextResponse.json({ error: 'Acceso restringido' }, { status: 403 })
  }
  return null
}

type OrderItem = {
  productId?: number
  id?: number
  title?: string
  price?: number
  quantity?: number
  planId?: number
  type?: string
  currency?: string
}

export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    const statusGroups = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const statusCounts = statusGroups.reduce<Record<string, number>>((acc, group) => {
      acc[group.status] = group._count.status
      return acc
    }, {})

    const orders = await prisma.order.findMany({
      where: { status: { in: ['COMPLETED', 'paid', 'PAID'] } },
      select: {
        id: true,
        totalAmount: true,
        items: true,
        planId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    const pendingOrders = await prisma.order.findMany({
      where: { status: { in: ['PENDING', 'pending'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        customerEmail: true,
        createdAt: true,
      },
    })

    const cancelledOrders = await prisma.order.findMany({
      where: { status: { in: ['CANCELLED', 'cancelled', 'CANCELED', 'canceled'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        customerEmail: true,
        createdAt: true,
      },
    })

    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0)
    const totalOrders = orders.length

    const itemMap = new Map<number, { id: number; title?: string; quantity: number; revenue: number }>()
    const planMap = new Map<number, { id: number; title?: string; quantity: number; revenue: number }>()

    for (const order of orders) {
      const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : []
      for (const item of items) {
        const productId = item.productId ?? item.id
        const quantity = Number(item.quantity || 1)
        const price = Number(item.price || 0)

        if (productId) {
          const existing = itemMap.get(productId) ?? { id: productId, title: item.title, quantity: 0, revenue: 0 }
          existing.quantity += quantity
          existing.revenue += quantity * price
          if (!existing.title && item.title) existing.title = item.title
          itemMap.set(productId, existing)
        }

        if (item.type === 'plan' && item.planId) {
          const existing = planMap.get(item.planId) ?? { id: item.planId, title: item.title, quantity: 0, revenue: 0 }
          existing.quantity += quantity
          existing.revenue += quantity * price
          if (!existing.title && item.title) existing.title = item.title
          planMap.set(item.planId, existing)
        }
      }

      if (order.planId) {
        const existing = planMap.get(order.planId) ?? { id: order.planId, title: undefined, quantity: 0, revenue: 0 }
        existing.quantity += 1
        existing.revenue += order.totalAmount || 0
        planMap.set(order.planId, existing)
      }
    }

    const itemIds = Array.from(itemMap.keys())
    const planIds = Array.from(planMap.keys())

    if (itemIds.length) {
      const items = await prisma.item.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, title: true },
      })
      for (const item of items) {
        const entry = itemMap.get(item.id)
        if (entry) entry.title = item.title
      }
    }

    if (planIds.length) {
      const plans = await prisma.plan.findMany({
        where: { id: { in: planIds } },
        select: { id: true, title: true },
      })
      for (const plan of plans) {
        const entry = planMap.get(plan.id)
        if (entry) entry.title = plan.title
      }
    }

    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    const topPlans = Array.from(planMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    return NextResponse.json({
      totals: { totalRevenue, totalOrders },
      statusCounts,
      pendingOrders,
      cancelledOrders,
      topItems,
      topPlans,
    })
  } catch (error) {
    console.error('Error obteniendo ventas:', error)
    return NextResponse.json({ error: 'Error obteniendo ventas' }, { status: 500 })
  }
}

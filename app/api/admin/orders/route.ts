import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/requireAdmin'
import { expireStalePendingOrders } from '@/lib/orders/expiry'

export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    await expireStalePendingOrders()

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        customerEmail: true,
        customerFirstName: true,
        customerLastName: true,
        paymentMethod: true,
        paymentId: true,
        planId: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error listando órdenes:', error)
    return NextResponse.json({ error: 'Error listando órdenes' }, { status: 500 })
  }
}

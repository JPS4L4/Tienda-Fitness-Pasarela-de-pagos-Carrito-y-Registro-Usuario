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

export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

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

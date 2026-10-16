import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/requireAdmin'

export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { orders: true, subscriptions: true } },
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error listando usuarios:', error)
    return NextResponse.json({ error: 'Error listando usuarios' }, { status: 500 })
  }
}

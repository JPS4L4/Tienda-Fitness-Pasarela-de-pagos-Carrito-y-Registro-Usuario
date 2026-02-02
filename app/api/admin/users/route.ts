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

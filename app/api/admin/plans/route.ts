import { NextRequest, NextResponse } from 'next/server'
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

    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        price: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error listando planes:', error)
    return NextResponse.json({ error: 'Error listando planes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    const body = await request.json()
    const { type, title, slug, price } = body

    if (!type || !title || !slug || price === undefined) {
      return NextResponse.json({ error: 'Campos requeridos faltantes.' }, { status: 400 })
    }

    const plan = await prisma.plan.create({
      data: {
        type,
        title,
        slug,
        price: Number(price),
        currency: body.currency || 'COP',
        tags: body.tags ?? [],
        coverage: body.coverage ?? [],
        image: body.image ?? null,
        description: body.description ?? null,
        shortDescription: body.shortDescription ?? null,
      },
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error('Error creando plan:', error)
    return NextResponse.json({ error: 'Error creando plan' }, { status: 500 })
  }
}

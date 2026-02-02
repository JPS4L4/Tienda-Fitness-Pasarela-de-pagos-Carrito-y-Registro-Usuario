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

    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        currency: true,
        category: true,
        stock: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error listando items:', error)
    return NextResponse.json({ error: 'Error listando items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    const body = await request.json()
    const { title, slug, price, currency, category } = body

    if (!title || !slug || price === undefined || !category) {
      return NextResponse.json({ error: 'Campos requeridos faltantes.' }, { status: 400 })
    }

    const item = await prisma.item.create({
      data: {
        title,
        slug,
        price: Number(price),
        currency: currency || 'COP',
        category,
        stock: Number(body.stock ?? 0),
        images: body.images ?? [],
        tags: body.tags ?? [],
        description: body.description ?? null,
        shortDescription: body.shortDescription ?? null,
        freeShipping: body.freeShipping ?? false,
        isOfferOfTheDay: body.isOfferOfTheDay ?? false,
        discount: body.discount ?? null,
        originalPrice: body.originalPrice ?? null,
        installments: body.installments ?? null,
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error creando item:', error)
    return NextResponse.json({ error: 'Error creando item' }, { status: 500 })
  }
}

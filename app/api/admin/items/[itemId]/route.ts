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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    const { itemId } = await params
    const item = await prisma.item.findUnique({
      where: { id: Number(itemId) },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error obteniendo item:', error)
    return NextResponse.json({ error: 'Error obteniendo item' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    const { itemId } = await params
    const body = await request.json()

    const item = await prisma.item.update({
      where: { id: Number(itemId) },
      data: {
        title: body.title,
        slug: body.slug,
        price: body.price !== undefined ? Number(body.price) : undefined,
        currency: body.currency,
        category: body.category,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        images: body.images,
        tags: body.tags,
        description: body.description,
        shortDescription: body.shortDescription,
        freeShipping: body.freeShipping,
        isOfferOfTheDay: body.isOfferOfTheDay,
        discount: body.discount,
        originalPrice: body.originalPrice,
        installments: body.installments,
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error actualizando item:', error)
    return NextResponse.json({ error: 'Error actualizando item' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    const { itemId } = await params
    await prisma.item.delete({ where: { id: Number(itemId) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando item:', error)
    return NextResponse.json({ error: 'Error eliminando item' }, { status: 500 })
  }
}

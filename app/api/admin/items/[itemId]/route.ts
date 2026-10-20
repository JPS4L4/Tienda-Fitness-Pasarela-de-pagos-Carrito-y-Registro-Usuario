import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/requireAdmin'
import { validateCatalogMoney } from '@/lib/catalogValidation'

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
    const authResult = await requireAdmin({ write: true })
    if (authResult) return authResult

    const { itemId } = await params
    const body = await request.json()

    const money = validateCatalogMoney(body, { partial: true, kind: 'item' })
    if (!money.ok) {
      return NextResponse.json({ error: money.error }, { status: 400 })
    }

    // El precio original debe seguir siendo mayor que el precio vigente aunque solo cambie uno de los dos
    if (money.value.price !== undefined || money.value.originalPrice !== undefined) {
      const current = await prisma.item.findUnique({
        where: { id: Number(itemId) },
        select: { price: true, originalPrice: true },
      })
      if (!current) {
        return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 })
      }
      const price = money.value.price ?? current.price
      const originalPrice =
        money.value.originalPrice !== undefined ? money.value.originalPrice : current.originalPrice
      if (originalPrice !== null && originalPrice <= price) {
        return NextResponse.json(
          { error: 'El precio original debe ser mayor que el precio actual.' },
          { status: 400 }
        )
      }
    }

    const item = await prisma.item.update({
      where: { id: Number(itemId) },
      data: {
        title: body.title,
        slug: body.slug,
        price: money.value.price,
        category: body.category,
        stock: money.value.stock,
        images: body.images,
        tags: body.tags,
        description: body.description,
        shortDescription: body.shortDescription,
        freeShipping: body.freeShipping,
        isOfferOfTheDay: body.isOfferOfTheDay,
        discount: money.value.discount,
        originalPrice: money.value.originalPrice,
        installments: money.value.installments,
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
    const authResult = await requireAdmin({ write: true })
    if (authResult) return authResult

    const { itemId } = await params
    await prisma.item.delete({ where: { id: Number(itemId) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando item:', error)
    return NextResponse.json({ error: 'Error eliminando item' }, { status: 500 })
  }
}

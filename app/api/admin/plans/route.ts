import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/requireAdmin'
import { validateCatalogMoney } from '@/lib/catalogValidation'

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
        discount: true,
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
    const authResult = await requireAdmin({ write: true })
    if (authResult) return authResult

    const body = await request.json()
    const { type, title, slug, price } = body

    if (!type || !title || !slug || price === undefined) {
      return NextResponse.json({ error: 'Campos requeridos faltantes.' }, { status: 400 })
    }

    const money = validateCatalogMoney(body, { kind: 'plan' })
    if (!money.ok) {
      return NextResponse.json({ error: money.error }, { status: 400 })
    }

    const plan = await prisma.plan.create({
      data: {
        type,
        title,
        slug,
        price: money.value.price!,
        discount: money.value.discount ?? null,
        currency: money.value.currency!,
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

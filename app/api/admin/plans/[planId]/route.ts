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
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    const { planId } = await params
    const plan = await prisma.plan.findUnique({
      where: { id: Number(planId) },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error obteniendo plan:', error)
    return NextResponse.json({ error: 'Error obteniendo plan' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    const { planId } = await params
    const body = await request.json()

    const plan = await prisma.plan.update({
      where: { id: Number(planId) },
      data: {
        type: body.type,
        title: body.title,
        slug: body.slug,
        price: body.price !== undefined ? Number(body.price) : undefined,
        currency: body.currency,
        tags: body.tags,
        coverage: body.coverage,
        image: body.image,
        description: body.description,
        shortDescription: body.shortDescription,
      },
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error actualizando plan:', error)
    return NextResponse.json({ error: 'Error actualizando plan' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (authResult) return authResult

    const { planId } = await params
    await prisma.plan.delete({ where: { id: Number(planId) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando plan:', error)
    return NextResponse.json({ error: 'Error eliminando plan' }, { status: 500 })
  }
}

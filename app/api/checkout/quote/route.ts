import { NextRequest, NextResponse } from 'next/server'
import { CheckoutError, priceCart, pricePlan } from '@/lib/orders/pricing'

/**
 * Cotización del checkout: devuelve los precios y el total calculados por el servidor (misma lógica
 * que usa el cobro). La UI los toma como fuente de verdad en lugar de los precios que tenga
 * guardados el cliente (carrito de invitado, compra directa). No crea órdenes ni requiere sesión.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    if (body?.type === 'plan') {
      const { plan, total } = await pricePlan(body.planId)
      return NextResponse.json({
        type: 'plan',
        total,
        plan: { id: plan.id, price: plan.price, discount: plan.discount },
      })
    }

    const { lines, total } = await priceCart(body?.items)
    return NextResponse.json({
      type: 'cart',
      total,
      lines: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        price: line.price,
        listPrice: line.originalPrice,
        discount: line.discount,
      })),
    })
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error cotizando checkout:', error)
    return NextResponse.json({ error: 'No se pudo calcular el total' }, { status: 500 })
  }
}

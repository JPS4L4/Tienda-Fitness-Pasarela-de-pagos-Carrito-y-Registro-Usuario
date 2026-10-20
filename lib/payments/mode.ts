// lib/payments/mode.ts
// Modo de pagos de la tienda. `demo` (por defecto, también si la variable falta) simula pagos, correos y
// envíos sin llamar a ninguna API externa; `live` activa las pasarelas reales (Stripe / Mercado Pago).
import { NextResponse } from 'next/server'

export type PaymentMode = 'demo' | 'live'

export function parsePaymentMode(value: string | undefined | null): PaymentMode {
  return value?.trim().toLowerCase() === 'live' ? 'live' : 'demo'
}

/** Solo servidor: lee PAYMENT_MODE en cada llamada (no se congela en el build). */
export const getPaymentMode = (): PaymentMode => parsePaymentMode(process.env.PAYMENT_MODE)
export const isDemoMode = () => getPaymentMode() === 'demo'
export const isLiveMode = () => getPaymentMode() === 'live'

/** Guarda para las rutas de pasarelas reales: en modo demo responden 404 y no tocan ninguna API. */
export function requireLiveMode(): NextResponse | null {
  if (isLiveMode()) return null
  return NextResponse.json(
    { error: 'Los pagos reales están desactivados: la tienda está en modo demo' },
    { status: 404 }
  )
}

/** Guarda para las rutas del pago simulado: fuera del modo demo no existen. */
export function requireDemoMode(): NextResponse | null {
  if (isDemoMode()) return null
  return NextResponse.json({ error: 'El pago simulado solo existe en modo demo' }, { status: 404 })
}

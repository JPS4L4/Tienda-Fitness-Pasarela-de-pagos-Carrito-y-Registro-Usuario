import type { ReactNode } from 'react'
import { BRAND_NAME } from '@/lib/brand'
import { TEST_CARDS } from '@/lib/payments/card'
import type { PaymentMode } from '@/lib/payments/mode'

const SHELL = 'border-b-2 border-warn bg-warn/10 text-warn'
const LIST = 'list-disc space-y-0.5 pl-5 md:flex md:list-none md:flex-wrap md:gap-x-6 md:space-y-0 md:pl-0'

/**
 * Aviso compacto: una línea con el resumen y el detalle plegable.
 * En móvil el detalle va colapsado (<details>, sin JavaScript); desde md se muestra siempre abierto.
 */
function Banner({ summary, mobileSummary, children }: { summary: string; mobileSummary: string; children: ReactNode }) {
  return (
    <div role="note" className={SHELL}>
      <details className="group container mx-auto px-4 py-2 text-sm md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <span className="font-bold">{mobileSummary}</span>
          <span className="shrink-0 underline underline-offset-2 group-open:hidden">Ver tarjetas</span>
          <span className="hidden shrink-0 underline underline-offset-2 group-open:inline">Ocultar</span>
        </summary>
        <div className="mt-2 space-y-2">{children}</div>
      </details>

      <div className="container mx-auto hidden px-4 py-3 text-sm md:block">
        <p className="font-bold">{summary}</p>
        <div className="mt-1 space-y-1">{children}</div>
      </div>
    </div>
  )
}

/** Aviso de entorno de demostración: no se cobra nada; incluye las tarjetas de prueba. */
export default function TestModeBanner({ mode = 'demo' }: { mode?: PaymentMode }) {
  if (mode === 'demo') {
    return (
      <Banner
        summary="Modo demo: los pagos, correos y envíos son simulados; no se cobra nada."
        mobileSummary="Modo demo: pagos simulados"
      >
        <p>
          {BRAND_NAME} es un proyecto de demostración y no se conecta a ninguna pasarela. No ingreses datos reales;
          usa estas tarjetas de prueba:
        </p>
        <ul className={LIST}>
          {TEST_CARDS.map((card) => (
            <li key={card.number}>
              <code>{card.number}</code>: {card.label.toLowerCase()}.
            </li>
          ))}
          <li>Cualquier otra tarjeta con número válido también se aprueba.</li>
        </ul>
        <p>Usa cualquier fecha futura, un CVC de 3 dígitos y cualquier titular.</p>
      </Banner>
    )
  }

  return (
    <Banner
      summary="Modo prueba: no se realiza ningún cobro real."
      mobileSummary="Modo prueba: sin cobros reales"
    >
      <p>
        {BRAND_NAME} es un proyecto de demostración. Usa estas tarjetas de prueba; no ingreses datos reales.
      </p>
      <ul className={LIST}>
        <li>
          <strong>Stripe:</strong> <code>4242 4242 4242 4242</code>, cualquier fecha futura y cualquier CVC de 3
          dígitos.
        </li>
        <li>
          <strong>Mercado Pago:</strong> Mastercard <code>5254 1336 7440 3564</code> o Visa{' '}
          <code>4013 5406 8274 6260</code>, vencimiento <code>11/30</code>, CVV <code>123</code>, titular{' '}
          <code>APRO</code> y documento <code>123456789</code>.
        </li>
      </ul>
    </Banner>
  )
}

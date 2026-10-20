import { BRAND_NAME } from '@/lib/brand'
import { TEST_CARDS } from '@/lib/payments/card'
import type { PaymentMode } from '@/lib/payments/mode'

/** Aviso de entorno de demostración: no se cobra nada; incluye las tarjetas de prueba. */
export default function TestModeBanner({ mode = 'demo' }: { mode?: PaymentMode }) {
  if (mode === 'demo') {
    return (
      <div role="note" className="border-b-2 border-warn bg-warn/10 px-4 py-4 text-warn">
        <div className="container mx-auto text-sm">
          <p className="font-bold">
            Modo demo: los pagos, correos y envíos son simulados; no se cobra nada.
          </p>
          <p className="mt-1">
            {BRAND_NAME} es un proyecto de demostración y no se conecta a ninguna pasarela. No ingreses datos
            reales; usa estas tarjetas de prueba:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {TEST_CARDS.map((card) => (
              <li key={card.number}>
                <code>{card.number}</code>: {card.label.toLowerCase()}.
              </li>
            ))}
            <li>Cualquier otra tarjeta con número válido también se aprueba.</li>
          </ul>
          <p className="mt-2">Usa cualquier fecha futura, un CVC de 3 dígitos y cualquier titular.</p>
        </div>
      </div>
    )
  }

  return (
    <div role="note" className="border-b-2 border-warn bg-warn/10 px-4 py-4 text-warn">
      <div className="container mx-auto text-sm">
        <p className="font-bold">Modo prueba: no se realiza ningún cobro real.</p>
        <p className="mt-1">
          {BRAND_NAME} es un proyecto de demostración. Usa estas tarjetas de prueba; no ingreses datos reales.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Stripe:</strong> <code>4242 4242 4242 4242</code>, cualquier fecha futura y cualquier CVC de 3 dígitos.
          </li>
          <li>
            <strong>Mercado Pago:</strong> Mastercard <code>5254 1336 7440 3564</code> o Visa{' '}
            <code>4013 5406 8274 6260</code>, vencimiento <code>11/30</code>, CVV <code>123</code>, titular{' '}
            <code>APRO</code> y documento <code>123456789</code>.
          </li>
        </ul>
      </div>
    </div>
  )
}

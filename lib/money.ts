// Dinero: formato único (UI y correos), descuento y conversión a unidad menor de Stripe.
// Formato es-CO; COP sin decimales.
const formatters = new Map<string, Intl.NumberFormat>()

const getFormatter = (currency: string) => {
  let formatter = formatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'COP' ? 0 : 2,
      minimumFractionDigits: 0,
    })
    formatters.set(currency, formatter)
  }
  return formatter
}

/** Formatea un monto como moneda. Ej.: formatPrice(129900) -> "$ 129.900". */
export function formatPrice(amount: number | null | undefined, currency: string = 'COP'): string {
  const value = Number(amount)
  return getFormatter(currency || 'COP').format(Number.isFinite(value) ? value : 0)
}

/**
 * Precio final con descuento porcentual, redondeado al múltiplo de 100 COP más cercano
 * (los precios en pesos no usan centavos). Fuente única: la usan la UI y el servidor.
 */
export function applyDiscount(price: number, discount?: number | null): number {
  if (!discount) return price
  return Math.round((price * (1 - discount / 100)) / 100) * 100
}

/**
 * Monto en la unidad menor de Stripe. COP es una moneda de dos decimales en Stripe
 * (https://docs.stripe.com/currencies): $129.900 COP se envía como 12990000. MercadoPago, en cambio,
 * recibe los pesos enteros (sin multiplicar).
 */
export const toMinorUnits = (amount: number) => Math.round(amount * 100)

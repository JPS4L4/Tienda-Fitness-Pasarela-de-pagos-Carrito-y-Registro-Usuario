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

/** Texto que se muestra cuando un precio falta o es inválido (nunca "$ 0"). */
export const PRICE_UNAVAILABLE = 'Precio no disponible'

/** Piso de un precio final: ningún producto o servicio se cobra por menos de esto (COP). */
export const MIN_FINAL_PRICE = 100

/** Descuento porcentual máximo permitido en el catálogo. */
export const MAX_DISCOUNT = 90

/**
 * Formatea un monto como moneda. Ej.: formatPrice(129900) -> "$ 129.900".
 * Un monto ausente o no numérico muestra PRICE_UNAVAILABLE en vez de "$ 0".
 */
export function formatPrice(amount: number | null | undefined, currency: string = 'COP'): string {
  if (amount === null || amount === undefined) return PRICE_UNAVAILABLE
  const value = Number(amount)
  if (!Number.isFinite(value)) return PRICE_UNAVAILABLE
  return getFormatter(currency || 'COP').format(value)
}

/** Un precio de venta es válido solo si es un número finito mayor que cero. */
export const isValidPrice = (price: unknown): price is number =>
  typeof price === 'number' && Number.isFinite(price) && price > 0

/** Descuento utilizable: entero entre 1 y MAX_DISCOUNT; cualquier otro valor se ignora (null). */
export function normalizeDiscount(discount: unknown): number | null {
  if (discount === null || discount === undefined) return null
  const value = Number(discount)
  if (!Number.isFinite(value)) return null
  const rounded = Math.round(value)
  if (rounded < 1) return null
  return Math.min(rounded, MAX_DISCOUNT)
}

/**
 * Precio final con descuento porcentual, redondeado al múltiplo de 100 COP más cercano
 * (los precios en pesos no usan centavos). Fuente única: la usan la UI y el servidor.
 * El descuento se acota a 0-90 % y el resultado nunca baja de MIN_FINAL_PRICE (ni supera el precio).
 */
export function applyDiscount(price: number, discount?: number | null): number {
  const percent = normalizeDiscount(discount)
  if (!percent || !isValidPrice(price)) return price
  const discounted = Math.round((price * (1 - percent / 100)) / 100) * 100
  return Math.min(price, Math.max(MIN_FINAL_PRICE, discounted))
}

export type PriceDisplay = {
  /** false si el precio de lista es inválido: no debe mostrarse ni venderse */
  valid: boolean
  /** Precio que se cobra */
  final: number
  /** Precio tachado (lista o "antes") o null si no hay rebaja */
  previous: number | null
  /** Porcentaje de la insignia "-X%" o null */
  badge: number | null
}

/**
 * Cómo mostrar el precio de un producto o plan. Fuente única de la UI:
 * - con descuento almacenado: final = applyDiscount(price), tachado = price, insignia = descuento;
 * - sin descuento pero con originalPrice > price: final = price, tachado = originalPrice,
 *   insignia = porcentaje real redondeado;
 * - si no, solo el precio.
 */
export function getPriceDisplay(input: {
  price?: number | null
  discount?: number | null
  originalPrice?: number | null
}): PriceDisplay {
  const { price } = input
  if (!isValidPrice(price)) return { valid: false, final: 0, previous: null, badge: null }

  const discount = normalizeDiscount(input.discount)
  if (discount) {
    const final = applyDiscount(price, discount)
    return final < price
      ? { valid: true, final, previous: price, badge: discount }
      : { valid: true, final, previous: null, badge: null }
  }

  const original = input.originalPrice
  if (isValidPrice(original) && original > price) {
    const badge = Math.round((1 - price / original) * 100)
    return { valid: true, final: price, previous: original, badge: badge >= 1 ? badge : null }
  }
  return { valid: true, final: price, previous: null, badge: null }
}

/** Precio final ya formateado (con descuento aplicado) o PRICE_UNAVAILABLE si el precio no es válido. */
export function formatFinalPrice(
  input: { price?: number | null; discount?: number | null; originalPrice?: number | null },
  currency: string = 'COP'
): string {
  const display = getPriceDisplay(input)
  return display.valid ? formatPrice(display.final, currency) : PRICE_UNAVAILABLE
}

/**
 * Monto en la unidad menor de Stripe. COP es una moneda de dos decimales en Stripe
 * (https://docs.stripe.com/currencies): $129.900 COP se envía como 12990000. MercadoPago, en cambio,
 * recibe los pesos enteros (sin multiplicar).
 */
export const toMinorUnits = (amount: number) => Math.round(amount * 100)

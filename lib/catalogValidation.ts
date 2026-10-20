/**
 * lib/catalogValidation.ts
 * Validación única de los campos de dinero del catálogo (productos y planes) para las APIs de admin.
 * Todo el catálogo se vende en COP; ningún precio puede ser 0, negativo o no numérico.
 */
import { MAX_DISCOUNT } from '@/lib/money'
import { isSubscriptionType, SUBSCRIPTION_TYPES, type SubscriptionType } from '@/lib/planDuration'

export const CATALOG_CURRENCY = 'COP'
export const MIN_CATALOG_PRICE = 100
export const MAX_CATALOG_PRICE = 100_000_000
export const MAX_STOCK = 100_000
export const MAX_INSTALLMENTS = 48

export type CatalogMoneyInput = {
  price?: unknown
  discount?: unknown
  originalPrice?: unknown
  stock?: unknown
  installments?: unknown
  currency?: unknown
}

export type CatalogMoney = {
  price: number
  discount: number | null
  originalPrice: number | null
  stock: number
  installments: number | null
  currency: string
}

export type CatalogMoneyResult =
  | { ok: true; value: Partial<CatalogMoney> }
  | { ok: false; error: string }

const isBlank = (value: unknown) => value === undefined || value === null || value === ''

/** Convierte a número sin aceptar texto vacío, booleanos ni NaN/Infinity. */
const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') return Number(value)
  return Number.NaN
}

type Options = {
  /** true en PUT parciales: los campos ausentes se omiten del resultado */
  partial?: boolean
  /** los planes no tienen stock, installments ni originalPrice */
  kind?: 'item' | 'plan'
}

/**
 * Valida y normaliza los campos de dinero. En modo parcial solo valida los presentes y devuelve
 * únicamente esos; `price` es obligatorio si no es parcial.
 */
export function validateCatalogMoney(
  input: CatalogMoneyInput,
  { partial = false, kind = 'item' }: Options = {}
): CatalogMoneyResult {
  const out: Partial<CatalogMoney> = {}
  const has = (key: keyof CatalogMoneyInput) => !partial || input[key] !== undefined

  if (has('price')) {
    const price = toNumber(input.price)
    if (!Number.isInteger(price) || price <= 0) {
      return { ok: false, error: 'El precio debe ser un número entero mayor que 0.' }
    }
    if (price < MIN_CATALOG_PRICE) {
      return { ok: false, error: `El precio mínimo es ${MIN_CATALOG_PRICE} COP.` }
    }
    if (price > MAX_CATALOG_PRICE) {
      return { ok: false, error: `El precio máximo es ${MAX_CATALOG_PRICE.toLocaleString('es-CO')} COP.` }
    }
    out.price = price
  }

  if (has('discount')) {
    if (isBlank(input.discount)) {
      out.discount = null
    } else {
      const discount = toNumber(input.discount)
      if (!Number.isInteger(discount) || discount < 0 || discount > MAX_DISCOUNT) {
        return { ok: false, error: `El descuento debe ser un entero entre 0 y ${MAX_DISCOUNT}.` }
      }
      out.discount = discount === 0 ? null : discount
    }
  }

  if (kind === 'item') {
    if (has('originalPrice')) {
      if (isBlank(input.originalPrice)) {
        out.originalPrice = null
      } else {
        const originalPrice = toNumber(input.originalPrice)
        if (!Number.isInteger(originalPrice) || originalPrice <= 0) {
          return { ok: false, error: 'El precio original debe ser un número entero mayor que 0.' }
        }
        // Se compara contra el precio nuevo si viene en la misma petición
        if (out.price !== undefined && originalPrice <= out.price) {
          return { ok: false, error: 'El precio original debe ser mayor que el precio actual.' }
        }
        out.originalPrice = originalPrice
      }
    }

    if (has('stock')) {
      const stock = isBlank(input.stock) && !partial ? 0 : toNumber(input.stock)
      if (!Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) {
        return { ok: false, error: `El stock debe ser un entero entre 0 y ${MAX_STOCK}.` }
      }
      out.stock = stock
    }

    if (has('installments')) {
      if (isBlank(input.installments)) {
        out.installments = null
      } else {
        const installments = toNumber(input.installments)
        if (!Number.isInteger(installments) || installments < 1 || installments > MAX_INSTALLMENTS) {
          return { ok: false, error: `Las cuotas deben ser un entero entre 1 y ${MAX_INSTALLMENTS}.` }
        }
        out.installments = installments
      }
    }
  }

  if (!isBlank(input.currency) && input.currency !== CATALOG_CURRENCY) {
    return { ok: false, error: `Solo se admite la moneda ${CATALOG_CURRENCY}.` }
  }
  if (!partial) out.currency = CATALOG_CURRENCY

  return { ok: true, value: out }
}

export type PlanDurationResult =
  | { ok: true; value: SubscriptionType | undefined }
  | { ok: false; error: string }

/**
 * Valida la duración de un plan. Si falta: en creación (no parcial) se usa mensual y en PUT parcial
 * se omite (no se cambia). Un valor presente pero desconocido se rechaza.
 */
export function validatePlanDuration(
  value: unknown,
  { partial = false }: { partial?: boolean } = {}
): PlanDurationResult {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: partial ? undefined : 'monthly' }
  }
  if (!isSubscriptionType(value)) {
    return { ok: false, error: `La duración debe ser una de: ${SUBSCRIPTION_TYPES.join(', ')}.` }
  }
  return { ok: true, value }
}

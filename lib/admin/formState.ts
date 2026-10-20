/**
 * lib/admin/formState.ts
 * Mapeo puro registro -> estado del formulario -> payload para el CRUD de admin.
 * Al editar, cada campo editable se precarga desde el registro y el payload solo envía lo que el
 * formulario administra: así guardar sin tocar nada no vacía imágenes, tags, cobertura ni descripción.
 */
import { CATALOG_CURRENCY, validateCatalogMoney, validatePlanDuration } from '@/lib/catalogValidation'
import { DEFAULT_PLAN_DURATION, normalizeDuration, type SubscriptionType } from '@/lib/planDuration'

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

/** Texto "a, b, c" -> ["a","b","c"] (para tags y cobertura). */
export const parseList = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

const joinList = (value: string[] | null | undefined) => (value ?? []).join(', ')
const numberText = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value)
const discountText = (value: number | null | undefined) => (value ? String(value) : '')

/* ----------------------------------- Items ----------------------------------- */

export type ItemRecord = {
  id: number
  title: string
  slug: string
  price: number
  currency: string
  category: string
  stock: number
  images?: string[] | null
  tags?: string[] | null
  description?: string | null
  shortDescription?: string | null
  freeShipping?: boolean | null
  isOfferOfTheDay?: boolean | null
  discount?: number | null
  originalPrice?: number | null
  installments?: number | null
}

export type ItemFormState = {
  id?: number
  title: string
  slug: string
  price: string
  currency: string
  category: string
  stock: string
  /** URLs o data URLs ya guardadas/subidas; se conservan tal cual */
  images: string[]
  tags: string
  description: string
  shortDescription: string
  freeShipping: boolean
  isOfferOfTheDay: boolean
  discount: string
  originalPrice: string
  installments: string
}

export const emptyItemForm: ItemFormState = {
  title: '',
  slug: '',
  price: '',
  currency: CATALOG_CURRENCY,
  category: '',
  stock: '0',
  images: [],
  tags: '',
  description: '',
  shortDescription: '',
  freeShipping: false,
  isOfferOfTheDay: false,
  discount: '',
  originalPrice: '',
  installments: '',
}

export function itemToForm(item: ItemRecord): ItemFormState {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    price: String(item.price),
    currency: item.currency,
    category: item.category,
    stock: String(item.stock),
    images: [...(item.images ?? [])],
    tags: joinList(item.tags),
    description: item.description ?? '',
    shortDescription: item.shortDescription ?? '',
    freeShipping: Boolean(item.freeShipping),
    isOfferOfTheDay: Boolean(item.isOfferOfTheDay),
    discount: discountText(item.discount),
    originalPrice: numberText(item.originalPrice),
    installments: numberText(item.installments),
  }
}

export type PayloadResult<T> = { ok: true; payload: T } | { ok: false; error: string }

export function itemFormToPayload(form: ItemFormState): PayloadResult<Record<string, unknown>> {
  const money = validateCatalogMoney(form, { kind: 'item' })
  if (!money.ok) return { ok: false, error: money.error }
  return {
    ok: true,
    payload: {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      price: money.value.price,
      currency: CATALOG_CURRENCY,
      category: form.category.trim(),
      stock: money.value.stock,
      images: form.images,
      tags: parseList(form.tags),
      description: form.description.trim() || null,
      shortDescription: form.shortDescription.trim() || null,
      freeShipping: form.freeShipping,
      isOfferOfTheDay: form.isOfferOfTheDay,
      discount: money.value.discount,
      originalPrice: money.value.originalPrice,
      installments: money.value.installments,
    },
  }
}

/* ----------------------------------- Planes ----------------------------------- */

export type PlanRecord = {
  id: number
  type: string
  title: string
  slug: string
  price: number
  currency: string
  discount?: number | null
  durationType?: string | null
  tags?: string[] | null
  coverage?: string[] | null
  image?: string | null
  description?: string | null
  shortDescription?: string | null
}

export type PlanFormState = {
  id?: number
  type: string
  title: string
  slug: string
  price: string
  discount: string
  currency: string
  durationType: SubscriptionType
  tags: string
  coverage: string
  /** URL o data URL; se conserva al editar */
  image: string
  description: string
  shortDescription: string
}

export const emptyPlanForm: PlanFormState = {
  type: 'nutricion',
  title: '',
  slug: '',
  price: '',
  discount: '',
  currency: CATALOG_CURRENCY,
  durationType: DEFAULT_PLAN_DURATION,
  tags: '',
  coverage: '',
  image: '',
  description: '',
  shortDescription: '',
}

export function planToForm(plan: PlanRecord): PlanFormState {
  return {
    id: plan.id,
    type: plan.type,
    title: plan.title,
    slug: plan.slug,
    price: String(plan.price),
    discount: discountText(plan.discount),
    currency: plan.currency,
    durationType: normalizeDuration(plan.durationType),
    tags: joinList(plan.tags),
    coverage: joinList(plan.coverage),
    image: plan.image ?? '',
    description: plan.description ?? '',
    shortDescription: plan.shortDescription ?? '',
  }
}

export function planFormToPayload(form: PlanFormState): PayloadResult<Record<string, unknown>> {
  const money = validateCatalogMoney(form, { kind: 'plan' })
  if (!money.ok) return { ok: false, error: money.error }
  const duration = validatePlanDuration(form.durationType)
  if (!duration.ok) return { ok: false, error: duration.error }
  return {
    ok: true,
    payload: {
      type: form.type.trim(),
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      price: money.value.price,
      discount: money.value.discount,
      currency: CATALOG_CURRENCY,
      durationType: duration.value,
      tags: parseList(form.tags),
      coverage: parseList(form.coverage),
      image: form.image.trim() || null,
      description: form.description.trim() || null,
      shortDescription: form.shortDescription.trim() || null,
    },
  }
}

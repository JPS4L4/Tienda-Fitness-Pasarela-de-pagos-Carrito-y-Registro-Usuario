/**
 * lib/planDuration.ts
 * Duración de la suscripción de un plan. Los valores coinciden con los que entiende
 * calculateExpirationDate (lib/tokenService.ts). Sin dependencias de servidor: se usa también en el cliente.
 */
export const SUBSCRIPTION_TYPES = ['monthly', 'quarterly', 'yearly', 'lifetime'] as const
export type SubscriptionType = (typeof SUBSCRIPTION_TYPES)[number]

export const DEFAULT_PLAN_DURATION: SubscriptionType = 'monthly'

export const isSubscriptionType = (value: unknown): value is SubscriptionType =>
  typeof value === 'string' && (SUBSCRIPTION_TYPES as readonly string[]).includes(value)

/** Normaliza un valor de la BD (o desconocido) a un tipo válido; lo inválido cae a mensual. */
export const normalizeDuration = (value: unknown): SubscriptionType =>
  isSubscriptionType(value) ? value : DEFAULT_PLAN_DURATION

const LABELS: Record<SubscriptionType, { name: string; suffix: string }> = {
  monthly: { name: 'Mensual', suffix: '/ mes' },
  quarterly: { name: 'Trimestral', suffix: '/ trimestre' },
  yearly: { name: 'Anual', suffix: '/ año' },
  lifetime: { name: 'Pago único', suffix: 'pago único' },
}

/** "Mensual", "Trimestral", "Anual" o "Pago único". */
export const durationName = (value: unknown): string => LABELS[normalizeDuration(value)].name

/** Sufijo junto al precio: "/ mes", "/ trimestre", "/ año" o "pago único". */
export const durationSuffix = (value: unknown): string => LABELS[normalizeDuration(value)].suffix

export const DURATION_OPTIONS = SUBSCRIPTION_TYPES.map((value) => ({ value, label: LABELS[value].name }))

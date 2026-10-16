// Nombre de marca único para UI, metadatos y correos.
export const BRAND_NAME = 'Fitness Studio'
export const BRAND_TAGLINE = 'Productos, planes y entrenamiento personalizado'
export const BRAND_DESCRIPTION =
  'Tienda fitness con equipamiento, planes de nutrición y entrenamiento personalizado. Paga con tarjeta o Mercado Pago.'
export const BRAND_CONTACT_EMAIL = 'contacto@fitness-studio.example'

// Prefijo de claves de localStorage (el anterior era "nan-salazar").
export const STORAGE_PREFIX = 'fitness-studio'
export const LEGACY_STORAGE_PREFIX = 'nan-salazar'

/** Mueve un valor guardado con el prefijo anterior a la clave nueva (solo si la nueva no existe). */
export function migrateLegacyStorageKey(newKey: string, legacyKey: string): void {
  if (typeof window === 'undefined') return
  try {
    const legacy = localStorage.getItem(legacyKey)
    if (legacy === null) return
    if (localStorage.getItem(newKey) === null) localStorage.setItem(newKey, legacy)
    localStorage.removeItem(legacyKey)
  } catch {
    // localStorage no disponible: se ignora la migración
  }
}

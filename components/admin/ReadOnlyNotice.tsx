import { READONLY_ADMIN_MESSAGE } from '@/lib/adminAuth'

/** Aviso para cuentas de administración de solo lectura (demo): las mutaciones devuelven 403. */
export default function ReadOnlyNotice() {
  return (
    <p role="status" className="mb-6 border border-warn bg-warn/10 px-4 py-3 text-sm text-warn">
      {READONLY_ADMIN_MESSAGE}. Puedes explorar el panel, pero crear, editar o eliminar está deshabilitado.
    </p>
  )
}

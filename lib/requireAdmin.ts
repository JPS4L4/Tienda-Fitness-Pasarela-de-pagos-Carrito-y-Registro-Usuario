// lib/requireAdmin.ts
// Único punto de control de acceso de administrador en el servidor.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/nextAuth'
import { isReadOnlyAdminEmail, READONLY_ADMIN_MESSAGE } from '@/lib/adminAuth'
import { isVerifiedAdmin } from '@/lib/adminAccess'

/** Devuelve la sesión si el usuario es administrador con correo verificado; si no, null. */
export async function getAdminSession() {
  const session = await auth()
  if (!session?.user?.email || !(await isVerifiedAdmin(session.user.email))) return null
  return session
}

/**
 * Para rutas API: devuelve null si el usuario es administrador,
 * o la respuesta 401/403 que la ruta debe retornar.
 * Las mutaciones deben pasar `{ write: true }`: la cuenta demo (solo lectura) recibe 403.
 */
export async function requireAdmin(options: { write?: boolean } = {}): Promise<NextResponse | null> {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!(await isVerifiedAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Acceso restringido' }, { status: 403 })
  }
  if (options.write && isReadOnlyAdminEmail(session.user.email)) {
    return NextResponse.json({ error: READONLY_ADMIN_MESSAGE }, { status: 403 })
  }
  return null
}

/** true si la sesión actual es de una cuenta de administración de solo lectura (demo). */
export async function isReadOnlyAdminSession(): Promise<boolean> {
  const session = await auth()
  return isReadOnlyAdminEmail(session?.user?.email)
}

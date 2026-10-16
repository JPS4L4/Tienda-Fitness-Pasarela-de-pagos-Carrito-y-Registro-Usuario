// lib/requireAdmin.ts
// Único punto de control de acceso de administrador en el servidor.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/nextAuth'
import { isAdminEmail } from '@/lib/adminAuth'

/** Devuelve la sesión si el usuario es administrador; si no, null. */
export async function getAdminSession() {
  const session = await auth()
  if (!session?.user?.email || !isAdminEmail(session.user.email)) return null
  return session
}

/**
 * Para rutas API: devuelve null si el usuario es administrador,
 * o la respuesta 401/403 que la ruta debe retornar.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Acceso restringido' }, { status: 403 })
  }
  return null
}

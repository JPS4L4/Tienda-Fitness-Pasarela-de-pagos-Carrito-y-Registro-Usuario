// lib/adminAccess.ts
// Acceso de administrador en el servidor: estar en ADMIN_EMAILS no basta, el correo debe estar
// verificado (user.emailVerified). Usa Prisma, por eso no se importa desde el middleware.
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/adminAuth'

export async function isVerifiedAdmin(email?: string | null): Promise<boolean> {
  if (!email || !isAdminEmail(email)) return false
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { emailVerified: true },
  })
  return Boolean(user?.emailVerified)
}

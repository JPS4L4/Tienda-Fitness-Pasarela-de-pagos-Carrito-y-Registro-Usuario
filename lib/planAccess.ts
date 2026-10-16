// lib/planAccess.ts
// Quién puede ver el contenido de pago de un plan: admins y suscriptores activos.
import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/adminAuth'
import { SUBSCRIPTION_STATUS } from '@/lib/orders/constants'

export async function canViewPlanContent(session: Session | null, planId: number): Promise<boolean> {
  if (!session?.user) return false
  if (isAdminEmail(session.user.email)) return true

  const userId = Number.parseInt(session.user.id, 10)
  if (!Number.isInteger(userId)) return false

  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      planId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { gt: new Date() },
    },
    select: { id: true },
  })
  return !!subscription
}

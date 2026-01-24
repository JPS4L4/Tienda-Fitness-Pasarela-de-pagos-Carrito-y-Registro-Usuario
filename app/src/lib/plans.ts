// app/src/lib/plans.ts
import { prisma } from "@/lib/prisma"
import { adaptPlanToPlanUI } from "../adapters/planAdapter"

export async function getPlansForUI() {
  const plans = await prisma.plan.findMany()

  return plans.map(adaptPlanToPlanUI)
}

// app/src/lib/plans.ts
import { prisma } from "@/lib/prisma"
import { adaptPlanToPlanUI } from "../adapters/planAdapter"
import { PlanUI } from "../types/plan"

export async function getPlansForUI() {
  const plans = await prisma.plan.findMany()

  return plans.map(adaptPlanToPlanUI)
}

export async function getPlanBySlug(slug: string): Promise<PlanUI | null> {
  const plan = await prisma.plan.findUnique({
    where: { slug },
  });

  if (!plan) return null;

  return adaptPlanToPlanUI(plan);
}

// app/src/lib/plans.ts
import { prisma } from "@/lib/prisma"
import { adaptPlanToPlanUI } from "../adapters/planAdapter"
import { PlanUI } from "../types/plan"

export async function getPlansForUI() {
  const plans = await prisma.plan.findMany()

  const aggregates = await prisma.review.groupBy({
    by: ["planId"],
    where: { planId: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  })

  const ratingsMap = new Map<number, { avg: number; count: number }>()
  aggregates.forEach((aggregate) => {
    if (aggregate.planId) {
      ratingsMap.set(aggregate.planId, {
        avg: aggregate._avg.rating ?? 0,
        count: aggregate._count.rating ?? 0,
      })
    }
  })

  return plans.map((plan) => {
    const ratingData = ratingsMap.get(plan.id)
    return adaptPlanToPlanUI({
      ...plan,
      rating: ratingData?.avg ?? plan.rating,
      reviewCount: ratingData?.count ?? plan.reviewCount,
    })
  })
}

export async function getPlanBySlug(slug: string): Promise<PlanUI | null> {
  const plan = await prisma.plan.findUnique({
    where: { slug },
  });

  if (!plan) return null;

  const aggregate = await prisma.review.aggregate({
    where: { planId: plan.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return adaptPlanToPlanUI({
    ...plan,
    rating: aggregate._avg.rating ?? plan.rating,
    reviewCount: aggregate._count.rating ?? plan.reviewCount,
  });
}

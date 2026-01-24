// app/src/adapters/planAdapter.ts
import { PlanUI } from "../types/plan";

export type PlanFromDB = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  shortDescription: string | null;
    tags: string[];
    rating: number;
    reviewCount: number;
    price: string;
    discount?: number | null;
    coverage: string[]
    slug: string;
    createdAt: Date;
    updatedAt: Date;
};

export function adaptPlanToPlanUI(plan: PlanFromDB): PlanUI {
  return {
    id: plan.id,
    type: plan.type,
    title: plan.title,
    shortDescription: plan.shortDescription ?? "",
    tags: plan.tags,
    price: plan.price,
    discount: plan.discount ?? undefined,
    slug: plan.slug,
    coverage: plan.coverage,
  };
}
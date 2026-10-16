// app/src/adapters/planAdapter.ts
import { PlanUI } from "../types/plan";
import { Decimal } from "@prisma/client/runtime/library";

export type PlanFromDB = {
  id: number;
  type: string;                 // "nutricion" | "entrenamiento"
  title: string;
  image: string | null;
  description: string | null;
  shortDescription: string | null;
  tags: string[];
  rating: number;
  reviewCount: number;
  price: Decimal | number | string;      // Float en Prisma → Decimal | number | string
  currency?: string;            // Opcional (default COP)
  discount?: number | null;
  coverage: string[];
  slug: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
};


/**
 * `content` es el material de pago del plan: solo se incluye si el llamador lo pide
 * explícitamente (tras comprobar que el usuario es suscriptor activo o admin).
 */
export function adaptPlanToPlanUI(
  plan: PlanFromDB,
  options: { includeContent?: boolean } = {}
): PlanUI {
  const price = (() => {
    if (typeof plan.price === 'object' && 'toNumber' in plan.price) {
      return plan.price.toNumber();
    }
    return Number(plan.price);
  })();

  return {
    id: plan.id,
    type: plan.type,
    title: plan.title,
    image: plan.image ?? undefined,
    description: plan.description ?? undefined,
    shortDescription: plan.shortDescription ?? "",
    tags: plan.tags,
    coverage: plan.coverage,
    price,
    discount: plan.discount ?? 0,
    currency: plan.currency ?? "COP",
    slug: plan.slug,
    content: options.includeContent ? plan.content ?? undefined : undefined,
    rating: plan.rating,
    reviewCount: plan.reviewCount,
  };
}

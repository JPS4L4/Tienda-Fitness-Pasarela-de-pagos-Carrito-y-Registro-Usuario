// app/src/types/plan.ts
import type { SubscriptionType } from "@/lib/planDuration";

export type PlanUI = {
    id: number;
    type: string;
    title: string;
    image?: string;
    description?: string;
    shortDescription: string;
    tags: string[];
    price: number;
    currency: string;
    discount?: number | null;
    slug: string;
    coverage: string[];
    durationType: SubscriptionType;
    content?: string;
    rating?: number;
    reviewCount?: number;
}
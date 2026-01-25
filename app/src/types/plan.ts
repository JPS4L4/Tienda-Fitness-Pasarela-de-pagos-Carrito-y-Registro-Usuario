// app/src/types/plan.ts
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
    content?: string;
    rating?: number;
    reviewCount?: number;
}
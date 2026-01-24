// app/src/types/plan.ts
export type PlanUI = {
    id: string;
    type: string;
    title: string;
    shortDescription: string;
    tags: string[];
    price: string;
    discount?: number | null;
    slug: string;
    coverage: string[];  
}
// app/src/lib/products.ts
import { prisma } from "@/lib/prisma"
import { adaptItemToItemUI } from "../adapters/itemAdapter"
import { ItemUI } from "../types/item";

export async function getItemsForUI() {
  const items = await prisma.item.findMany()

  const aggregates = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  })

  const ratingsMap = new Map<number, { avg: number; count: number }>()
  aggregates.forEach((aggregate) => {
    if (aggregate.productId) {
      ratingsMap.set(aggregate.productId, {
        avg: aggregate._avg.rating ?? 0,
        count: aggregate._count.rating ?? 0,
      })
    }
  })

  return items.map((item) => {
    const ratingData = ratingsMap.get(item.id)
    return adaptItemToItemUI({
      ...item,
      rating: ratingData?.avg ?? item.rating,
      reviewCount: ratingData?.count ?? item.reviewCount,
    })
  })
}

export async function getItemBySlug(slug: string): Promise<ItemUI | null> {
  const item = await prisma.item.findUnique({
    where: { slug },
  });

  if (!item) return null;

  const aggregate = await prisma.review.aggregate({
    where: { productId: item.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return adaptItemToItemUI({
    ...item,
    rating: aggregate._avg.rating ?? item.rating,
    reviewCount: aggregate._count.rating ?? item.reviewCount,
  });
}
import { ItemUI } from "../types/item"
import { Decimal } from "@prisma/client/runtime/library";

// Esto representa cómo viene Prisma
export type ItemFromDB = {
  id: number
  title: string
  description: string | null
  shortDescription: string | null
  price: Decimal | number
  currency?: string
  category: string
  originalPrice: Decimal | number | null
  discount: number | null
  installments: number | null
  freeShipping: boolean | null
  images: string[]
  isOfferOfTheDay: boolean | null
  tags: string[]
  slug: string
  stock: number
  rating: number
  reviewCount: number
  specs: any
  createdAt: Date
  updatedAt: Date
}

export function adaptItemToItemUI(item: ItemFromDB): ItemUI {
  const price = (() => {
    if (typeof item.price === 'object' && 'toNumber' in item.price) {
      return item.price.toNumber();
    }
    return Number(item.price);
  })();

  const originalPrice = (() => {
    if (!item.originalPrice) return undefined;
    if (typeof item.originalPrice === 'object' && 'toNumber' in item.originalPrice) {
      return item.originalPrice.toNumber();
    }
    return Number(item.originalPrice);
  })();

  return {
    id: item.id,
    title: item.title,
    description: item.description ?? undefined,
    shortDescription: item.shortDescription ?? undefined,
    price,
    currency: item.currency || "COP",
    originalPrice,
    discount: item.discount || 0,
    category: item.category,
    image: item.images[0] ?? "",
    images: item.images,
    slug: item.slug,
    freeShipping: item.freeShipping ?? undefined,
    isOfferOfTheDay: item.isOfferOfTheDay ?? undefined,
    tags: item.tags,
    stock: item.stock,
    rating: item.rating,
    reviewCount: item.reviewCount,
    specs: item.specs,
  };
}


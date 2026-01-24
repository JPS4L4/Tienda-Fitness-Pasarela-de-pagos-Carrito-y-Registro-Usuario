import { ItemUI } from "../types/item"
import { Decimal } from "@prisma/client/runtime/library";

// Esto representa cómo viene Prisma
export type ProductFromDB = {
  id: string
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
  createdAt: Date
  updatedAt: Date
}

export function adaptProductToItemUI(product: ProductFromDB): ItemUI {
  const price = (() => {
    if (typeof product.price === 'object' && 'toNumber' in product.price) {
      return product.price.toNumber();
    }
    return Number(product.price);
  })();

  const originalPrice = (() => {
    if (!product.originalPrice) return undefined;
    if (typeof product.originalPrice === 'object' && 'toNumber' in product.originalPrice) {
      return product.originalPrice.toNumber();
    }
    return Number(product.originalPrice);
  })();

  return {
    id: product.id,
    title: product.title,
    price,
    currency: product.currency || "COP",
    originalPrice,
    discount: product.discount || 0,
    category: product.category,
    image: product.images[0] ?? "",
    slug: product.slug,
    freeShipping: product.freeShipping ?? undefined,
    isOfferOfTheDay: product.isOfferOfTheDay ?? undefined,
  };
}


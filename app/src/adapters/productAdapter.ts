import { ItemUI } from "../types/item"

// Esto representa cómo viene Prisma (ejemplo)
export type ProductFromDB = {
  id: string
  title: string
  description: string | null
  shortDescription: string | null
  price: number
  category: string
  originalPrice: number | null
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
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
    originalPrice: product.originalPrice ?? undefined,
    discount: product.discount ?? undefined,
    installments: product.installments ?? undefined,
    image: product.images[0],
    isOfferOfTheDay: product.isOfferOfTheDay ?? false,
    slug: product.slug,
  }
}

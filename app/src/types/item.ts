// app/src/types/item.ts
export type ItemUI = {
  id: number
  title: string
  description?: string
  shortDescription?: string
  price: number
  currency: string
  category: string
  originalPrice?: number
  discount?: number
  installments?: number
  freeShipping?: boolean
  image?: string
  images?: string[]
  isOfferOfTheDay?: boolean
  slug: string
  tags?: string[]
  stock?: number
  rating?: number
  reviewCount?: number
  specs?: any
}

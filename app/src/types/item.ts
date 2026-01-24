// app/src/types/item.ts
export type ItemUI = {
  id: string
  title: string
  price: number
  currency: string
  category: string
  originalPrice?: number
  discount?: number
  installments?: number
  freeShipping?: boolean
  image?: string
  isOfferOfTheDay?: boolean
  slug: string
}

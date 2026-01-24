// app/src/types/item.ts
export type ItemUI = {
  id: string
  title: string
  price: number
  category: string
  originalPrice?: number
  discount?: number
  installments?: number
  freeShipping?: boolean
  image?: string
  isOfferOfTheDay?: boolean
  slug: string
}

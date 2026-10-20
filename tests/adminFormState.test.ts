import { describe, expect, it } from 'vitest'
import {
  itemFormToPayload,
  itemToForm,
  planFormToPayload,
  planToForm,
  type ItemRecord,
  type PlanRecord,
} from '@/lib/admin/formState'

const item: ItemRecord = {
  id: 7, title: 'Mancuernas', slug: 'mancuernas', price: 120000, currency: 'COP', category: 'Equipamiento', stock: 5,
  images: ['/images/a.jpg', 'data:image/jpeg;base64,AAAA,BBBB'],
  tags: ['fuerza', 'casa'], description: 'Largo', shortDescription: 'Corto',
  freeShipping: true, isOfferOfTheDay: true, discount: 15, originalPrice: 150000, installments: 6,
}

const plan: PlanRecord = {
  id: 3, type: 'nutricion', title: 'Plan Pro', slug: 'plan-pro', price: 90000, currency: 'COP', discount: 10,
  tags: ['dieta'], coverage: ['Menú semanal', 'Chat de soporte'], image: '/images/p.jpg',
  description: 'Descripción', shortDescription: 'Resumen',
}

describe('admin item form mapping', () => {
  it('editing without changes does not wipe images, tags, description or flags', () => {
    const result = itemFormToPayload(itemToForm(item))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.payload).toMatchObject({
      images: item.images, tags: item.tags, description: 'Largo', shortDescription: 'Corto',
      freeShipping: true, isOfferOfTheDay: true, discount: 15, originalPrice: 150000, installments: 6,
      price: 120000, stock: 5, category: 'Equipamiento', slug: 'mancuernas',
    })
  })

  it('keeps data URLs that contain commas intact', () => {
    const form = itemToForm(item)
    expect(form.images[1]).toBe('data:image/jpeg;base64,AAAA,BBBB')
  })

  it('maps null fields to empty strings and back to null', () => {
    const form = itemToForm({ ...item, description: null, discount: null, originalPrice: null, installments: null, images: null, tags: null })
    expect(form.description).toBe('')
    expect(form.images).toEqual([])
    const result = itemFormToPayload(form)
    expect(result.ok && result.payload).toMatchObject({ description: null, discount: null, originalPrice: null, images: [], tags: [] })
  })

  it('still rejects invalid money', () => {
    expect(itemFormToPayload({ ...itemToForm(item), price: '0' }).ok).toBe(false)
  })
})

describe('admin plan form mapping', () => {
  it('editing without changes keeps image, tags, coverage and description', () => {
    const result = planFormToPayload(planToForm(plan))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.payload).toMatchObject({
      image: '/images/p.jpg', tags: ['dieta'], coverage: ['Menú semanal', 'Chat de soporte'],
      description: 'Descripción', shortDescription: 'Resumen', discount: 10, type: 'nutricion',
    })
  })

  it('empty optional fields become null', () => {
    const result = planFormToPayload(planToForm({ ...plan, image: null, description: null, discount: null }))
    expect(result.ok && result.payload).toMatchObject({ image: null, description: null, discount: null })
  })
})

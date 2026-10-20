import { describe, expect, it } from 'vitest'
import { buildOrderEmails } from '@/lib/orders/simulatedEmail'

const base = {
  id: 12, planId: null, customerEmail: 'ana@example.com', customerFirstName: 'Ana', totalAmount: 150000,
  items: [{ title: 'Whey', quantity: 2, price: 75000 }],
  shippingAddress: 'Calle 1 #2-3', shippingCity: 'Bogotá',
}

describe('buildOrderEmails', () => {
  it('builds only the customer confirmation for product orders', () => {
    const emails = buildOrderEmails(base)
    expect(emails).toHaveLength(1)
    expect(emails[0].to).toBe('ana@example.com')
    expect(emails[0].subject).toContain('#12')
    expect(emails[0].body).toContain('Whey x2')
    expect(emails[0].body).toContain('Calle 1 #2-3, Bogotá')
    expect(emails[0].body).toContain('simulado')
  })

  it('adds the instructor notice for plan orders', () => {
    const emails = buildOrderEmails({ ...base, planId: 3, items: [{ type: 'plan', title: 'Plan Pro', price: 99000 }] })
    expect(emails.map((email) => email.kind)).toEqual(['customer-confirmation', 'instructor-notice'])
    expect(emails[1].subject).toContain('Plan Pro')
  })
})

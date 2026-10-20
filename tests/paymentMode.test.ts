import { describe, expect, it } from 'vitest'
import { parsePaymentMode } from '@/lib/payments/mode'

describe('parsePaymentMode', () => {
  it('defaults to demo when missing or unknown', () => {
    expect(parsePaymentMode(undefined)).toBe('demo')
    expect(parsePaymentMode('')).toBe('demo')
    expect(parsePaymentMode('production')).toBe('demo')
  })

  it('is live only for an explicit "live" value', () => {
    expect(parsePaymentMode('live')).toBe('live')
    expect(parsePaymentMode(' LIVE ')).toBe('live')
    expect(parsePaymentMode('demo')).toBe('demo')
  })
})

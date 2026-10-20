import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GUEST_TOKEN_TTL_MS, signGuestOrderToken, verifyGuestOrderToken } from '@/lib/orders/guestToken'

const NOW = Date.UTC(2026, 9, 20, 12, 0, 0)
const original = process.env.NEXTAUTH_SECRET

describe('guest order token', () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = 'test-secret-value'
  })
  afterEach(() => {
    process.env.NEXTAUTH_SECRET = original
  })

  it('verifies a freshly signed token for the same order', () => {
    const token = signGuestOrderToken(42, NOW)
    expect(verifyGuestOrderToken(42, token, NOW + 1000)).toBe(true)
  })

  it('rejects the token for a different order', () => {
    const token = signGuestOrderToken(42, NOW)
    expect(verifyGuestOrderToken(43, token, NOW)).toBe(false)
  })

  it('rejects an expired token', () => {
    const token = signGuestOrderToken(42, NOW)
    expect(verifyGuestOrderToken(42, token, NOW + GUEST_TOKEN_TTL_MS)).toBe(true)
    expect(verifyGuestOrderToken(42, token, NOW + GUEST_TOKEN_TTL_MS + 1)).toBe(false)
  })

  it('rejects tampered expiry or signature', () => {
    const token = signGuestOrderToken(42, NOW)
    const [expires, sig] = token.split('.')
    expect(verifyGuestOrderToken(42, `${Number(expires) + 1000}.${sig}`, NOW)).toBe(false)
    expect(verifyGuestOrderToken(42, `${expires}.${sig.slice(0, -2)}AA`, NOW)).toBe(false)
  })

  it('rejects a token signed with another secret', () => {
    const token = signGuestOrderToken(42, NOW)
    process.env.NEXTAUTH_SECRET = 'another-secret'
    expect(verifyGuestOrderToken(42, token, NOW)).toBe(false)
  })

  it('rejects malformed input', () => {
    for (const bad of [undefined, null, '', 'abc', '123', '1.2.3', 42, '-5.sig']) {
      expect(verifyGuestOrderToken(42, bad, NOW)).toBe(false)
    }
  })
})

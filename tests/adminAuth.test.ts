import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAdminEmails, isAdminEmail } from '@/lib/adminAuth'

describe('adminAuth (fail-closed)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('nobody is admin when ADMIN_EMAILS is missing or empty', () => {
    vi.stubEnv('ADMIN_EMAILS', '')
    expect(getAdminEmails()).toEqual([])
    expect(isAdminEmail('admin@example.com')).toBe(false)
  })

  it('matches case-insensitively and trims the configured list', () => {
    vi.stubEnv('ADMIN_EMAILS', ' Admin@Example.com , otro@example.com ')
    expect(getAdminEmails()).toEqual(['admin@example.com', 'otro@example.com'])
    expect(isAdminEmail('ADMIN@example.com')).toBe(true)
    expect(isAdminEmail('  otro@example.com')).toBe(true)
  })

  it('rejects unlisted, empty and nullish emails', () => {
    vi.stubEnv('ADMIN_EMAILS', 'admin@example.com')
    expect(isAdminEmail('intruso@example.com')).toBe(false)
    expect(isAdminEmail('')).toBe(false)
    expect(isAdminEmail(null)).toBe(false)
    expect(isAdminEmail(undefined)).toBe(false)
  })
})

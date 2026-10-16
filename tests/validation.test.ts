import { describe, expect, it } from 'vitest'
import {
  detectSQLInjection,
  detectXSS,
  sanitizeInput,
  validateEmail,
  validateLoginForm,
  validateName,
  validatePassword,
  validatePhone,
  validateRegisterForm,
} from '@/lib/validation'

describe('sanitizeInput', () => {
  it('strips angle brackets, javascript: and inline handlers', () => {
    expect(sanitizeInput('  <b>hola</b> ')).toBe('bhola/b')
    expect(sanitizeInput('javascript:alert(1)')).not.toMatch(/javascript:/i)
    expect(sanitizeInput('x onerror=boom')).not.toMatch(/onerror=/i)
  })

  it('caps the length at 500 characters', () => {
    expect(sanitizeInput('a'.repeat(900))).toHaveLength(500)
  })
})

describe('validateEmail', () => {
  it('accepts a normal address and rejects malformed ones', () => {
    expect(validateEmail('ana@example.com').valid).toBe(true)
    expect(validateEmail('').valid).toBe(false)
    expect(validateEmail('sin-arroba').valid).toBe(false)
    expect(validateEmail('a..b@example.com').valid).toBe(false)
  })
})

describe('validatePassword', () => {
  it('requires length, upper, lower, digit and special character', () => {
    expect(validatePassword('Prueba123!').valid).toBe(true)
    expect(validatePassword('corta1!').valid).toBe(false)
    expect(validatePassword('sinmayuscula1!').valid).toBe(false)
    expect(validatePassword('SINMINUSCULA1!').valid).toBe(false)
    expect(validatePassword('SinNumero!!').valid).toBe(false)
    expect(validatePassword('SinEspecial123').valid).toBe(false)
  })

  it('rejects very common passwords', () => {
    expect(validatePassword('Password1!').valid).toBe(false)
  })
})

describe('validateName and validatePhone', () => {
  it('validates names with accents and rejects digits', () => {
    expect(validateName('María Núñez').valid).toBe(true)
    expect(validateName('A').valid).toBe(false)
    expect(validateName('Juan123').valid).toBe(false)
  })

  it('validates phone formats', () => {
    expect(validatePhone('+57 300 123 4567').valid).toBe(true)
    expect(validatePhone('12').valid).toBe(false)
    expect(validatePhone('abc-defg-hij').valid).toBe(false)
  })
})

describe('attack detection', () => {
  it('flags common SQL injection payloads', () => {
    expect(detectSQLInjection("' OR '1'='1")).toBe(true)
    expect(detectSQLInjection('1; DROP TABLE users')).toBe(true)
    expect(detectSQLInjection('María Pérez')).toBe(false)
  })

  it('flags common XSS payloads', () => {
    expect(detectXSS('<script>alert(1)</script>')).toBe(true)
    expect(detectXSS('<img src=x onerror=alert(1)>')).toBe(true)
    expect(detectXSS('Hola mundo')).toBe(false)
  })
})

describe('form validators', () => {
  it('validateLoginForm accepts an email or a phone and rejects attacks', () => {
    expect(validateLoginForm('ana@example.com', 'Prueba123!').valid).toBe(true)
    expect(validateLoginForm('+573001234567', 'Prueba123!').valid).toBe(true)
    expect(validateLoginForm("' OR '1'='1", 'x12345').valid).toBe(false)
    expect(validateLoginForm('ana@example.com', '123').valid).toBe(false)
  })

  it('validateRegisterForm checks that passwords match and the optional phone', () => {
    const ok = validateRegisterForm('Ana Gómez', 'ana@example.com', 'Prueba123!', 'Prueba123!', '+573001234567')
    expect(ok.valid).toBe(true)
    const mismatch = validateRegisterForm('Ana Gómez', 'ana@example.com', 'Prueba123!', 'Otra123!')
    expect(mismatch).toEqual({ valid: false, error: 'Las contraseñas no coinciden' })
    expect(validateRegisterForm('Ana Gómez', 'ana@example.com', 'Prueba123!', 'Prueba123!', '1').valid).toBe(false)
  })
})

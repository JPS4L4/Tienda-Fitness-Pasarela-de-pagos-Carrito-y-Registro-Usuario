'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Revisa tu email para instrucciones de reset')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Error al procesar la solicitud')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Error de conexión')
      console.error(error)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        <div className="border border-line border-t-4 border-t-accent bg-surface">
          <div className="px-8 pt-10 pb-6 text-center">
            <h1 className="text-5xl text-fg">
              ¿Olvidaste tu Contraseña?
            </h1>
            <p className="mt-3 text-muted text-lg">
              Te enviaremos un email con instrucciones para resetearla
            </p>
          </div>

          <div className="px-8 pb-10">
            {status === 'success' ? (
              <div className="bg-ok/10 border-l-4 border-ok p-6 ">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-ok font-semibold text-lg">¡Éxito!</h3>
                    <p className="text-ok mt-1">{message}</p>
                    <p className="text-ok text-sm mt-2">Revisa también la carpeta de spam.</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input"
                    required
                  />
                </div>

                {status === 'error' && (
                  <div className="bg-danger/10 border-l-4 border-danger p-4 ">
                    <p className="text-danger text-sm">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn btn-primary btn-lg btn-block"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="spinner !h-5 !w-5" aria-hidden="true" />
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Instrucciones'
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="px-8 py-6 bg-surface-2 border-t border-line text-center">
            <Link
              href="/login"
              className="text-accent hover:underline font-medium transition-colors"
            >
              Volver al Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

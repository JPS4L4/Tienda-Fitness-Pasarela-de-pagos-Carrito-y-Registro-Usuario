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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-8 pt-10 pb-6 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ¿Olvidaste tu Contraseña?
            </h1>
            <p className="mt-3 text-slate-600 text-lg">
              Te enviaremos un email con instrucciones para resetearla
            </p>
          </div>

          <div className="px-8 pb-10">
            {status === 'success' ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-green-800 font-semibold text-lg">¡Éxito!</h3>
                    <p className="text-green-700 mt-1">{message}</p>
                    <p className="text-green-700 text-sm mt-2">Revisa también la carpeta de spam.</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
                    required
                  />
                </div>

                {status === 'error' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <p className="text-red-700 text-sm">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-lg ${
                    status === 'loading'
                      ? 'bg-teal-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Instrucciones'
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Volver al Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

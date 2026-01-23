'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordContent() {
  const [status, setStatus] = useState<'validating' | 'valid' | 'expired' | 'resetting' | 'success'>('validating')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // Validar token al cargar
  useEffect(() => {
    if (!token) {
      setStatus('expired')
      setMessage('Token no proporcionado')
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setStatus('valid')
        } else {
          setStatus('expired')
          setMessage(data.error || 'Token inválido o expirado')
        }
      } catch (error) {
        setStatus('expired')
        setMessage('Error al validar token')
        console.error(error)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validaciones
    if (!password || !confirmPassword) {
      setError('Todos los campos son requeridos')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage(data.message)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Error al resetear contraseña')
      }
    } catch (error) {
      setError('Error de conexión')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'validating') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center">
              <svg className="animate-spin h-12 w-12 text-teal-500 mx-auto mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
              </svg>
              <h1 className="text-3xl font-extrabold text-slate-900">Validando...</h1>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (status === 'expired') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">Token Expirado</h1>
              <p className="mt-4 text-slate-600 text-lg">{message}</p>
            </div>
            <div className="px-8 pb-8">
              <Link
                href="/login?forgot=true"
                className="block w-full py-3 px-6 rounded-xl font-bold text-white text-center bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 transition-all"
              >
                Solicitar Nuevo Reset
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">¡Éxito!</h1>
              <p className="mt-4 text-slate-600 text-lg">{message}</p>
              <p className="mt-2 text-slate-500 text-sm">Redirigiendo al login...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Status === 'valid'
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-8 pt-10 pb-6 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Resetear Contraseña
            </h1>
            <p className="mt-3 text-slate-600 text-lg">
              Ingresa tu nueva contraseña
            </p>
          </div>

          <div className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nueva Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 rounded-xl text-gray-800 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all placeholder-slate-400 bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-lg ${
                  loading
                    ? 'bg-teal-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02] active:scale-95'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  'Resetear Contraseña'
                )}
              </button>
            </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center">
              <svg className="animate-spin h-12 w-12 text-teal-500 mx-auto mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
              </svg>
              <h1 className="text-3xl font-extrabold text-slate-900">Cargando...</h1>
            </div>
          </div>
        </div>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

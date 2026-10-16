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
      <main className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="w-full max-w-md">
          <div className="border border-line border-t-4 border-t-accent bg-surface">
            <div className="px-8 pt-10 pb-6 text-center">
              <span className="spinner !h-5 !w-5" aria-hidden="true" />
              <h1 className="text-3xl font-extrabold text-fg">Validando...</h1>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (status === 'expired') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="w-full max-w-md">
          <div className="border border-line border-t-4 border-t-accent bg-surface">
            <div className="px-8 pt-10 pb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16  bg-danger/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-fg">Token Expirado</h1>
              <p className="mt-4 text-muted text-lg">{message}</p>
            </div>
            <div className="px-8 pb-8">
              <Link
                href="/login?forgot=true"
                className="btn btn-primary btn-lg btn-block"
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
      <main className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="w-full max-w-md">
          <div className="border border-line border-t-4 border-t-accent bg-surface">
            <div className="px-8 pt-10 pb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16  bg-ok/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-fg">¡Éxito!</h1>
              <p className="mt-4 text-muted text-lg">{message}</p>
              <p className="mt-2 text-muted text-sm">Redirigiendo al login...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Status === 'valid'
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        <div className="border border-line border-t-4 border-t-accent bg-surface">
          <div className="px-8 pt-10 pb-6 text-center">
            <h1 className="text-5xl text-fg">
              Resetear Contraseña
            </h1>
            <p className="mt-3 text-muted text-lg">
              Ingresa tu nueva contraseña
            </p>
          </div>

          <div className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="password" className="label">
                    Nueva Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-danger/10 border-l-4 border-danger p-4 ">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg btn-block"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner !h-5 !w-5" aria-hidden="true" />
                    Procesando...
                  </span>
                ) : (
                  'Resetear Contraseña'
                )}
              </button>
            </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="w-full max-w-md">
          <div className="border border-line border-t-4 border-t-accent bg-surface">
            <div className="px-8 pt-10 pb-6 text-center">
              <span className="spinner !h-5 !w-5" aria-hidden="true" />
              <h1 className="text-3xl font-extrabold text-fg">Cargando...</h1>
            </div>
          </div>
        </div>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

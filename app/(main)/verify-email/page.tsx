'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const [result, setResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // Sin token no hay nada que verificar: el estado se deriva, no se guarda desde un efecto
  const status: 'loading' | 'success' | 'error' = !token ? 'error' : (result?.status ?? 'loading')
  const message = !token ? 'Token no proporcionado' : (result?.message ?? '')

  useEffect(() => {
    if (!token) return

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setResult({ status: 'success', message: '¡Email verificado exitosamente!' })
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setResult({ status: 'error', message: data.error || 'Error al verificar email' })
        }
      } catch (error) {
        setResult({ status: 'error', message: 'Error de conexión' })
        console.error(error)
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        <div className="border border-line border-t-4 border-t-accent bg-surface">
          <div className="px-8 pt-10 pb-6 text-center">
            {status === 'loading' && (
              <>
                <div className="flex justify-center mb-4">
                  <span className="spinner !h-5 !w-5" aria-hidden="true" />
                </div>
                <h1 className="text-5xl text-fg">
                  Verificando tu email
                </h1>
                <p className="mt-3 text-muted text-lg">
                  Un momento, estamos confirmando tu dirección de email...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16  bg-ok/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-5xl text-fg">
                  ¡Éxito!
                </h1>
                <p className="mt-3 text-muted text-lg">
                  {message}
                </p>
                <p className="mt-4 text-muted text-sm">
                  Redirigiendo a login en unos momentos...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16  bg-danger/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-5xl text-fg">
                  Oops
                </h1>
                <p className="mt-3 text-muted text-lg">
                  {message}
                </p>
              </>
            )}
          </div>

          {status === 'error' && (
            <div className="px-8 pb-8">
              <Link
                href="/login"
                className="btn btn-primary btn-lg btn-block"
              >
                Volver al Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  )
}

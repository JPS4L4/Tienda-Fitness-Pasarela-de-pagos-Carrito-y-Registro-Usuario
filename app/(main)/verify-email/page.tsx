'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token no proporcionado')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setStatus('success')
          setMessage('¡Email verificado exitosamente!')
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Error al verificar email')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Error de conexión')
        console.error(error)
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-8 pt-10 pb-6 text-center">
            {status === 'loading' && (
              <>
                <div className="flex justify-center mb-4">
                  <svg className="animate-spin h-12 w-12 text-teal-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Verificando tu email
                </h1>
                <p className="mt-3 text-slate-600 text-lg">
                  Un momento, estamos confirmando tu dirección de email...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  ¡Éxito!
                </h1>
                <p className="mt-3 text-slate-600 text-lg">
                  {message}
                </p>
                <p className="mt-4 text-slate-500 text-sm">
                  Redirigiendo a login en unos momentos...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Oops
                </h1>
                <p className="mt-3 text-slate-600 text-lg">
                  {message}
                </p>
              </>
            )}
          </div>

          {status === 'error' && (
            <div className="px-8 pb-8">
              <Link
                href="/login"
                className="block w-full py-3 px-6 rounded-xl font-bold text-white text-center bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 transition-all duration-300"
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
      <VerifyEmailContent />
    </Suspense>
  )
}

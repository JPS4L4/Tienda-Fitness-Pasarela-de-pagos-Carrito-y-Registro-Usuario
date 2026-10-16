'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full border border-line border-t-8 border-t-danger bg-surface p-6 md:p-12 text-center">
        {/* Ícono de error */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-danger/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl text-fg mb-4">
          Pago Rechazado
        </h1>
        
        <p className="text-xl text-muted mb-8">
          Tu pago no pudo ser procesado
        </p>

        <div className="bg-danger/10  p-6 mb-8 border-2 border-danger">
          <p className="text-danger font-medium">
            Por favor, verifica tus datos de pago e intenta nuevamente
          </p>
        </div>

        <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
          <p className="text-fg-soft font-medium mb-3">Posibles razones:</p>
          <ul className="space-y-2 text-muted">
            <li className="flex items-start gap-3">
              <span className="text-danger mt-1">•</span>
              <span>Fondos insuficientes en la tarjeta</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-danger mt-1">•</span>
              <span>Datos de tarjeta incorrectos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-danger mt-1">•</span>
              <span>Tarjeta expirada o bloqueada</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-danger mt-1">•</span>
              <span>Límite de transacciones excedido</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="btn btn-primary btn-lg"
          >
            Intentar de nuevo
          </button>
          
          <Link
            href="/"
            className="btn btn-secondary btn-lg"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-line">
          <p className="text-sm text-muted">
            ¿Necesitas ayuda? {' '}
            <Link href="/support" className="text-accent hover:underline font-medium">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
        {/* Ícono de error */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600"
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

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
          Pago Rechazado
        </h1>
        
        <p className="text-xl text-slate-600 mb-8">
          Tu pago no pudo ser procesado
        </p>

        <div className="bg-red-50 rounded-2xl p-6 mb-8 border-2 border-red-200">
          <p className="text-red-700 font-medium">
            Por favor, verifica tus datos de pago e intenta nuevamente
          </p>
        </div>

        <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
          <p className="text-slate-700 font-medium mb-3">Posibles razones:</p>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>Fondos insuficientes en la tarjeta</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>Datos de tarjeta incorrectos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>Tarjeta expirada o bloqueada</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>Límite de transacciones excedido</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-8 py-4 bg-linear-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Intentar de nuevo
          </button>
          
          <Link
            href="/"
            className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            ¿Necesitas ayuda? {' '}
            <Link href="/support" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PendingPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full border border-line border-t-8 border-t-warn bg-surface p-6 md:p-12 text-center">
        {/* Ícono de pendiente */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-warn/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-warn animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl text-fg mb-4">
          Pago Pendiente
        </h1>
        
        <p className="text-xl text-muted mb-8">
          Tu pago está siendo procesado
        </p>

        <div className="bg-warn/10  p-6 mb-8 border-2 border-warn">
          <p className="text-warn font-medium mb-2">
            Estamos esperando la confirmación del pago
          </p>
          <p className="text-warn text-sm">
            Esto puede tardar algunos minutos
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3 text-fg-soft">
            <svg className="w-6 h-6 text-warn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Te enviaremos un correo cuando se confirme</span>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-fg-soft">
            <svg className="w-6 h-6 text-warn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Recibirás una notificación en tu cuenta</span>
          </div>
        </div>

        <div className="text-sm text-muted mb-6">
          Serás redirigido automáticamente en <span className="font-bold text-warn">{countdown}s</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn btn-primary btn-lg"
          >
            Volver al inicio
          </Link>
          
          <Link
            href="/profile"
            className="btn btn-secondary btn-lg"
          >
            Ver mis pedidos
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-line">
          <p className="text-sm text-muted">
            ¿Tienes dudas? {' '}
            <Link href="/support" className="text-accent hover:underline font-medium">
              Centro de ayuda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

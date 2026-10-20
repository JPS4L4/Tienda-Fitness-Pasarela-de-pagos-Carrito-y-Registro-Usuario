'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { formatPrice } from '@/lib/money';
import { cn } from '@/lib/utils';

/** Pasos de la animación del pago simulado (el último es el resultado). */
export const PAYMENT_STEPS = [
  'Validando datos',
  'Verificando con el banco (3-D Secure simulado)',
  'Autorizando pago',
  'Pago aprobado',
] as const;

export type PaymentStage = {
  /** Índice del paso actual en PAYMENT_STEPS */
  step: number;
  result: 'running' | 'approved' | 'declined';
  /** Motivo del rechazo, si lo hay */
  reason?: string;
};

interface PaymentProgressProps {
  stage: PaymentStage | null;
  amount: number;
  /** Cierra el overlay tras un rechazo para reintentar con otra tarjeta */
  onRetry: () => void;
}

function StepMark({ state }: { state: 'done' | 'running' | 'failed' | 'pending' }) {
  const base = 'flex h-8 w-8 shrink-0 items-center justify-center border-2';
  if (state === 'done') {
    return (
      <span className={cn(base, 'border-ok bg-ok/15 text-ok')}>
        <Check className="h-5 w-5" aria-hidden="true" />
      </span>
    );
  }
  if (state === 'failed') {
    return (
      <span className={cn(base, 'border-danger bg-danger/15 text-danger')}>
        <X className="h-5 w-5" aria-hidden="true" />
      </span>
    );
  }
  if (state === 'running') {
    return (
      <span className={cn(base, 'border-accent')}>
        <span className="spinner" aria-hidden="true" />
      </span>
    );
  }
  return <span className={cn(base, 'border-line-strong')} />;
}

export default function PaymentProgress({ stage, amount, onRetry }: PaymentProgressProps) {
  const reduce = useReducedMotion();
  const retryRef = useRef<HTMLButtonElement>(null);
  const declined = stage?.result === 'declined';

  useEffect(() => {
    if (declined) retryRef.current?.focus();
  }, [declined]);

  // Bloquea el scroll del fondo mientras el overlay está abierto
  useEffect(() => {
    if (!stage) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [stage]);

  const progress = stage
    ? stage.result === 'approved'
      ? 100
      : Math.round(((stage.step + (declined ? 0 : 0.5)) / PAYMENT_STEPS.length) * 100)
    : 0;

  const stateOf = (index: number): 'done' | 'running' | 'failed' | 'pending' => {
    if (!stage) return 'pending';
    if (stage.result === 'approved') return 'done';
    if (index < stage.step) return 'done';
    if (index === stage.step) return stage.result === 'declined' ? 'failed' : 'running';
    return 'pending';
  };

  return (
    <AnimatePresence>
      {stage && (
        <motion.div
          key="payment-progress"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/90 p-4 backdrop-blur-sm"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-progress-title"
            className={cn(
              'w-full max-w-md border-2 bg-surface p-6 shadow-[8px_8px_0_0_var(--color-accent)] sm:p-8',
              declined ? 'border-danger shadow-[8px_8px_0_0_var(--color-danger)]' : 'border-line-strong'
            )}
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          >
            <p className="eyebrow">Pago simulado</p>
            <h2
              id="payment-progress-title"
              className={cn('mt-2 text-4xl', declined ? 'text-danger' : stage.result === 'approved' ? 'text-ok' : 'text-fg')}
            >
              {declined ? 'Pago rechazado' : stage.result === 'approved' ? 'Pago aprobado' : 'Procesando pago'}
            </h2>
            <p className="price mt-3 text-3xl text-accent">{formatPrice(amount)}</p>

            <div className="mt-6 h-2 bg-surface-3" role="presentation">
              <motion.div
                className={cn('h-full', declined ? 'bg-danger' : stage.result === 'approved' ? 'bg-ok' : 'bg-accent')}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.2, 0, 0, 1] }}
              />
            </div>

            <ol className="mt-6 space-y-4" aria-live="polite">
              {PAYMENT_STEPS.map((label, index) => {
                const state = stateOf(index);
                const shown = declined && index === stage.step ? 'Pago rechazado' : label;
                return (
                  <li
                    key={label}
                    className={cn(
                      'flex items-center gap-3 text-base font-semibold',
                      state === 'pending' && 'text-subtle',
                      state === 'running' && 'text-fg',
                      state === 'done' && 'text-fg-soft',
                      state === 'failed' && 'text-danger'
                    )}
                  >
                    <StepMark state={state} />
                    <span>{shown}</span>
                  </li>
                );
              })}
            </ol>

            {declined && (
              <div className="mt-6 space-y-4">
                <p role="alert" className="border border-danger bg-danger/10 p-3 text-sm text-danger">
                  {stage.reason || 'No se pudo autorizar el pago'}. Tu pedido sigue pendiente: puedes probar con otra
                  tarjeta.
                </p>
                <button ref={retryRef} type="button" onClick={onRetry} className="btn btn-primary btn-block">
                  Probar con otra tarjeta
                </button>
              </div>
            )}
            {stage.result === 'approved' && (
              <p className="mt-6 text-sm text-muted">Te llevamos a tu comprobante...</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

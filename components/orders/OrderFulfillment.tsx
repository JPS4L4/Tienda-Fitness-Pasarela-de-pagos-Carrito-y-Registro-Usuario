'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check, KeyRound, Package } from 'lucide-react';
import type { OrderFulfillment as Fulfillment, ShippingTracking } from '@/lib/orders/shipping';
import { cn } from '@/lib/utils';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

function Timeline({ tracking }: { tracking: ShippingTracking }) {
  const reduce = useReducedMotion();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Seguimiento simulado</p>
          <p className="mt-1 text-sm text-muted">
            {tracking.carrier} · Guía <span className="font-mono text-fg-soft">{tracking.trackingNumber}</span>
          </p>
        </div>
        <p className="text-sm text-muted">
          {tracking.delivered ? 'Entregado el ' : 'Entrega estimada: '}
          <span className="font-semibold text-fg-soft" suppressHydrationWarning>
            {formatDate(tracking.estimatedDelivery)}
          </span>
        </p>
      </div>

      <ol className="relative">
        {tracking.stages.map((stage, index) => {
          const current = index === tracking.currentIndex;
          return (
            <motion.li
              key={stage.key}
              className="relative flex gap-4 pb-6 last:pb-0"
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={reduce ? { duration: 0 } : { delay: index * 0.08, duration: 0.3 }}
              aria-current={current ? 'step' : undefined}
            >
              {/* Tramo del riel hacia la etapa siguiente; se rellena cuando esa etapa ya se alcanzó */}
              {index < tracking.stages.length - 1 && (
                <>
                  <span aria-hidden="true" className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-line-strong" />
                  {tracking.stages[index + 1].reached && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute bottom-0 left-[15px] top-8 w-0.5 origin-top bg-ok"
                      initial={reduce ? false : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={reduce ? { duration: 0 } : { delay: 0.2 + index * 0.12, duration: 0.4, ease: [0.2, 0, 0, 1] }}
                    />
                  )}
                </>
              )}
              <span
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center border-2 bg-surface',
                  stage.reached ? 'border-ok text-ok' : 'border-line-strong text-subtle',
                  current && !tracking.delivered && 'border-accent bg-accent text-on-accent shadow-[3px_3px_0_0_var(--color-fg)]',
                  current && tracking.delivered && 'bg-ok text-on-accent'
                )}
              >
                {stage.reached ? <Check className="h-4 w-4" aria-hidden="true" /> : <span className="h-1.5 w-1.5 bg-current" />}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={cn(
                    'font-bold uppercase tracking-wide',
                    current ? 'text-fg' : stage.reached ? 'text-fg-soft' : 'text-subtle'
                  )}
                >
                  {stage.label}
                  {current && !tracking.delivered && <span className="badge badge-accent ml-2 align-middle">Ahora</span>}
                </p>
                <p className={cn('text-sm', stage.reached ? 'text-muted' : 'text-subtle')}>
                  {stage.detail}
                  {' · '}
                  <span suppressHydrationWarning>
                    {stage.reached ? formatDate(stage.at) : `estimado ${formatDate(stage.at)}`}
                  </span>
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

/** Envío simulado (productos) o activación simulada (planes) de una orden pagada. */
export default function OrderFulfillment({ fulfillment }: { fulfillment: Fulfillment | null }) {
  if (!fulfillment) return null;

  if (fulfillment.kind === 'activation') {
    const { activation } = fulfillment;
    return (
      <div className="border border-line bg-surface p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-ok text-ok">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-2xl uppercase leading-none text-fg">
              {activation.active ? 'Acceso activado' : 'Acceso vencido'}
            </p>
            <p className="mt-2 text-sm text-muted">
              Activado el{' '}
              <span className="text-fg-soft" suppressHydrationWarning>
                {formatDate(activation.activatedAt)}
              </span>
              {activation.expiresAt && (
                <>
                  {' · '}
                  {activation.active ? 'vigente hasta el ' : 'venció el '}
                  <span className="text-fg-soft" suppressHydrationWarning>
                    {formatDate(activation.expiresAt)}
                  </span>
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-subtle">Activación simulada: tu plan queda disponible al instante en tu perfil.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-line bg-surface p-4">
      <div className="mb-4 flex items-center gap-2 text-fg">
        <Package className="h-5 w-5 text-accent" aria-hidden="true" />
        <p className="font-display text-2xl uppercase leading-none">Estado del envío</p>
      </div>
      <Timeline tracking={fulfillment.tracking} />
    </div>
  );
}

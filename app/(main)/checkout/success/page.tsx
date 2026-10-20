'use client';

import { formatPrice } from '@/lib/money'

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check, Clock, Mail, Printer, X } from 'lucide-react';
import OrderFulfillment from '@/components/orders/OrderFulfillment';
import { ORDER_STATUS } from '@/lib/orders/constants';
import type { OrderFulfillment as Fulfillment } from '@/lib/orders/shipping';
import type { SimulatedEmail } from '@/lib/orders/simulatedEmail';
import { cn } from '@/lib/utils';

type OrderItem = {
  title?: string;
  quantity?: number;
  price?: number;
  unit_price?: number;
  type?: string;
  planId?: number;
  subscriptionType?: string;
};

type OrderData = {
  id: number;
  status: string;
  statusLabel: string;
  totalAmount: number;
  planId?: number | null;
  paymentMethod?: string | null;
  paymentLabel: string;
  paymentId?: string | null;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  items: OrderItem[];
  createdAt: string;
  fulfillment: Fulfillment | null;
  emails: SimulatedEmail[];
};

const TONES = {
  [ORDER_STATUS.COMPLETED]: {
    title: '¡Pago aprobado!',
    text: 'Tu compra ha sido procesada correctamente',
    border: 'border-t-ok',
    tile: 'bg-ok/10 text-ok',
    heading: 'text-fg',
    Icon: Check,
  },
  [ORDER_STATUS.PENDING]: {
    title: 'Pago pendiente',
    text: 'Aún no recibimos la confirmación de tu pago',
    border: 'border-t-warn',
    tile: 'bg-warn/10 text-warn',
    heading: 'text-warn',
    Icon: Clock,
  },
  [ORDER_STATUS.CANCELLED]: {
    title: 'Pedido cancelado',
    text: 'Este pedido fue cancelado y no se realizó ningún cobro',
    border: 'border-t-danger',
    tile: 'bg-danger/10 text-danger',
    heading: 'text-danger',
    Icon: X,
  },
  [ORDER_STATUS.REFUNDED]: {
    title: 'Pedido reembolsado',
    text: 'El valor de este pedido fue devuelto',
    border: 'border-t-line-strong',
    tile: 'bg-surface-3 text-muted',
    heading: 'text-fg',
    Icon: X,
  },
} as const;

function SuccessContent() {
  const searchParams = useSearchParams();
  const { status: sessionStatus } = useSession();
  // MercadoPago devuelve external_reference = id de nuestra orden
  const orderId = searchParams.get('orderId') || searchParams.get('external_reference');
  const paymentId =
    searchParams.get('payment_id') ||
    searchParams.get('paymentId') ||
    searchParams.get('collection_id');
  // Invitados: token firmado de su orden (llega en la URL tras pagar)
  const guestToken = searchParams.get('t');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupQuery = useMemo(() => {
    if (orderId) return `orderId=${encodeURIComponent(orderId)}${guestToken ? `&t=${encodeURIComponent(guestToken)}` : ''}`;
    if (paymentId) return `paymentId=${encodeURIComponent(paymentId)}`;
    return null;
  }, [orderId, paymentId, guestToken]);

  useEffect(() => {
    if (!lookupQuery) return;
    setLoading(true);
    setError(null);

    fetch(`/api/orders/lookup?${lookupQuery}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'No se pudo cargar la orden');
        }
        return res.json();
      })
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lookupQuery]);

  const items = Array.isArray(order?.items) ? order.items : [];
  const tone = order ? (TONES[order.status as keyof typeof TONES] ?? TONES[ORDER_STATUS.PENDING]) : null;
  const retryHref = order?.planId
    ? `/checkout?type=plan&planId=${order.planId}`
    : '/checkout';

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div
        className={cn(
          'print-area w-full max-w-3xl border border-line border-t-8 bg-surface p-6 md:p-12',
          tone?.border ?? 'border-t-line-strong'
        )}
      >
        {/* Encabezado según el estado REAL de la orden */}
        {tone ? (
          <>
            <div className="mb-8 flex justify-center">
              <div className={cn('flex h-24 w-24 items-center justify-center', tone.tile)}>
                <tone.Icon className="h-12 w-12" strokeWidth={3} aria-hidden="true" />
              </div>
            </div>
            <h1 className={cn('mb-4 text-center text-5xl md:text-7xl', tone.heading)}>{tone.title}</h1>
            <p className="mb-8 text-center text-xl text-muted">{tone.text}</p>
          </>
        ) : (
          <>
            <h1 className="mb-4 text-center text-5xl text-fg md:text-7xl">
              {error ? 'No pudimos cargar tu pedido' : 'Tu pedido'}
            </h1>
            {!lookupQuery && (
              <p className="mb-8 text-center text-xl text-muted">No encontramos el número de tu pedido en el enlace.</p>
            )}
          </>
        )}

        {loading && (
          <div className="mb-8 bg-surface-2 p-6 text-center text-muted">Cargando comprobante...</div>
        )}

        {error && (
          <div role="alert" className="mb-8 border border-danger bg-danger/10 p-6 text-center text-danger">
            {error}
            {sessionStatus === 'unauthenticated' && !guestToken && (
              <p className="mt-2 text-sm">
                Si compraste como invitado, abre el enlace completo que recibiste al pagar (incluye tu código de acceso).
              </p>
            )}
          </div>
        )}

        {order && order.status === ORDER_STATUS.PENDING && (
          <div className="mb-8 border border-warn bg-warn/10 p-4 text-center text-warn no-print">
            <p className="font-semibold">Tu pedido está reservado pero no se ha cobrado.</p>
            <Link href={retryHref} className="btn btn-primary mt-4">
              Reintentar el pago
            </Link>
          </div>
        )}

        {order && (
          <div className="mb-8 space-y-6">
            <div className="bg-surface-2 p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">Número de orden</p>
                  <p className="price text-4xl text-accent">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Estado</p>
                  <p className={cn('text-base font-semibold', tone?.heading === 'text-fg' ? 'text-ok' : tone?.heading)}>
                    {order.statusLabel}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted">Fecha</p>
                  <p className="text-base font-semibold text-fg-soft" suppressHydrationWarning>
                    {new Date(order.createdAt).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="border border-line bg-surface p-4">
                  <p className="text-xs text-muted">Cliente</p>
                  {(order.customerFirstName || order.customerLastName) && (
                    <p className="text-sm font-semibold text-fg-soft">
                      {`${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim()}
                    </p>
                  )}
                  <p className="text-sm text-fg-soft">{order.customerEmail}</p>
                  {order.customerPhone && <p className="text-sm text-muted">{order.customerPhone}</p>}
                </div>
                <div className="border border-line bg-surface p-4">
                  <p className="text-xs text-muted">Pago</p>
                  <p className="text-sm font-semibold text-fg-soft">{order.paymentLabel}</p>
                  {order.paymentId && <p className="break-all text-sm text-muted">ID: {order.paymentId}</p>}
                </div>
              </div>

              {(order.shippingAddress || order.shippingCity || order.shippingState || order.shippingPostalCode) && (
                <div className="mb-6 border border-line bg-surface p-4">
                  <p className="text-xs text-muted">Dirección de envío</p>
                  <p className="text-sm text-fg-soft">
                    {order.shippingAddress}
                    {order.shippingCity ? `, ${order.shippingCity}` : ''}
                    {order.shippingState ? `, ${order.shippingState}` : ''}
                    {order.shippingPostalCode ? ` (${order.shippingPostalCode})` : ''}
                  </p>
                </div>
              )}

              <div className="border border-line bg-surface p-4">
                <p className="mb-3 text-xs text-muted">Detalle de compra</p>
                {items.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-muted">
                        <th className="pb-2 font-bold">Producto</th>
                        <th className="pb-2 text-right font-bold">Cant.</th>
                        <th className="hidden pb-2 text-right font-bold sm:table-cell">Precio</th>
                        <th className="pb-2 text-right font-bold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {items.map((item, idx) => {
                        const unit = item.unit_price ?? item.price;
                        const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
                        return (
                          <tr key={idx} className="text-fg-soft">
                            <td className="py-2 pr-2">{item.title || (item.type === 'plan' ? 'Plan' : 'Producto')}</td>
                            <td className="py-2 text-right">{quantity}</td>
                            <td className="hidden py-2 text-right sm:table-cell">{formatPrice(unit)}</td>
                            <td className="py-2 text-right font-semibold">
                              {unit === undefined ? formatPrice(undefined) : formatPrice(unit * quantity)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-muted">Sin detalle disponible.</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="text-sm font-semibold text-fg-soft">Total</span>
                  <span className="price text-3xl text-fg">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <OrderFulfillment fulfillment={order.fulfillment} />

            {order.emails.map((email) => (
              <div key={email.kind} className="border border-line bg-surface p-4 no-print">
                <div className="mb-3 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-accent" aria-hidden="true" />
                  <p className="font-display text-2xl uppercase leading-none text-fg">Correo enviado (simulado)</p>
                </div>
                <dl className="space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-muted">Para</dt>
                    <dd className="break-all text-fg-soft">{email.to}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-muted">Asunto</dt>
                    <dd className="font-semibold text-fg">{email.subject}</dd>
                  </div>
                </dl>
                <pre className="mt-3 whitespace-pre-wrap border-t border-line pt-3 font-sans text-sm text-fg-soft">
                  {email.body}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col justify-center gap-4 no-print sm:flex-row">
          <Link href="/" className="btn btn-primary btn-lg">
            Volver al inicio
          </Link>

          {order && sessionStatus === 'authenticated' && (
            <Link href={`/profile/orders?orderId=${order.id}`} className="btn btn-secondary btn-lg">
              Ver mi orden
            </Link>
          )}

          {order && (
            <button type="button" onClick={() => window.print()} className="btn btn-secondary btn-lg">
              <Printer className="h-5 w-5" aria-hidden="true" />
              Imprimir comprobante
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

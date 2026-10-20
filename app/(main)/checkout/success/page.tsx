'use client';

import { formatPrice } from '@/lib/money'

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
  totalAmount: number;
  paymentMethod?: string | null;
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
};

function SuccessContent() {
  const searchParams = useSearchParams();
  // MercadoPago devuelve external_reference = id de nuestra orden
  const orderId = searchParams.get('orderId') || searchParams.get('external_reference');
  const paymentId =
    searchParams.get('payment_id') ||
    searchParams.get('paymentId') ||
    searchParams.get('collection_id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupQuery = useMemo(() => {
    if (orderId) return `orderId=${orderId}`;
    if (paymentId) return `paymentId=${paymentId}`;
    return null;
  }, [orderId, paymentId]);

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

  const items = Array.isArray(order?.items) ? order?.items : [];

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-3xl w-full border border-line border-t-8 border-t-ok bg-surface p-6 md:p-12">
        {/* Ícono de éxito */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-ok/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-ok"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl text-fg mb-4 text-center">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-xl text-muted mb-8 text-center">
          Tu compra ha sido procesada correctamente
        </p>

        {loading && (
          <div className="bg-surface-2  p-6 mb-8 text-center text-muted">
            Cargando voucher...
          </div>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger  p-6 mb-8 text-center text-danger">
            {error}
          </div>
        )}

        {order && (
          <div className="bg-surface-2  p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-muted">Número de orden</p>
                <p className="text-2xl font-bold text-accent">#{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Estado</p>
                <p className="text-base font-semibold text-ok">{order.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Fecha</p>
                <p className="text-base font-semibold text-fg-soft">
                  {new Date(order.createdAt).toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-surface  p-4 border border-line">
                <p className="text-xs text-muted">Cliente</p>
                {(order.customerFirstName || order.customerLastName) && (
                  <p className="text-sm font-semibold text-fg-soft">
                    {`${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim()}
                  </p>
                )}
                <p className="text-sm text-fg-soft">{order.customerEmail}</p>
                {order.customerPhone && (
                  <p className="text-sm text-muted">{order.customerPhone}</p>
                )}
              </div>
              <div className="bg-surface  p-4 border border-line">
                <p className="text-xs text-muted">Pago</p>
                <p className="text-sm font-semibold text-fg-soft">
                  {order.paymentMethod || '—'}
                </p>
                {order.paymentId && (
                  <p className="text-sm text-muted">ID: {order.paymentId}</p>
                )}
              </div>
            </div>

            {(order.shippingAddress || order.shippingCity || order.shippingState || order.shippingPostalCode) && (
              <div className="bg-surface  p-4 border border-line mb-6">
                <p className="text-xs text-muted">Envío</p>
                <p className="text-sm text-fg-soft">
                  {order.shippingAddress}
                  {order.shippingCity ? `, ${order.shippingCity}` : ''}
                  {order.shippingState ? `, ${order.shippingState}` : ''}
                  {order.shippingPostalCode ? ` (${order.shippingPostalCode})` : ''}
                </p>
              </div>
            )}

            <div className="bg-surface  p-4 border border-line">
              <p className="text-xs text-muted mb-3">Detalle de compra</p>
              {items.length > 0 ? (
                <ul className="space-y-3">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-3 text-sm">
                      <div className="text-fg-soft">
                        {item.title || (item.type === 'plan' ? 'Plan' : 'Producto')}
                        {item.quantity ? ` x${item.quantity}` : ''}
                      </div>
                      <div className="font-semibold text-fg-soft">
                        {formatPrice(item.unit_price ?? item.price)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Sin detalle disponible.</p>
              )}
              <div className="flex items-center justify-between border-t border-line mt-4 pt-4">
                <span className="text-sm font-semibold text-fg-soft">Total</span>
                <span className="text-base font-bold text-fg">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3 text-fg-soft">
            <svg className="w-6 h-6 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Recibirás un correo de confirmación</span>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-fg-soft">
            <svg className="w-6 h-6 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Tu pedido será procesado pronto</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn btn-primary btn-lg"
          >
            Volver al inicio
          </Link>
          
          {order && (
            <Link
              href={`/profile/orders?orderId=${order.id}`}
              className="btn btn-secondary btn-lg"
            >
              Ver mi orden
            </Link>
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

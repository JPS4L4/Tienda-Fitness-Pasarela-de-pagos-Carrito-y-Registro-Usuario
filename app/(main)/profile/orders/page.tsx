import { formatPrice } from '@/lib/money'
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mis Compras',
  description: 'Historial de órdenes y compras del usuario',
};

type OrderItem = {
  title?: string;
  quantity?: number;
  price?: number;
  unit_price?: number;
  type?: string;
  planId?: number;
  subscriptionType?: string;
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = parseInt(session.user.id, 10);

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const resolvedSearchParams = await searchParams;
  const focusOrderId = resolvedSearchParams.orderId
    ? Number(resolvedSearchParams.orderId)
    : null;

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl text-fg">Mis Compras</h1>
            <p className="text-muted mt-2">Consulta el detalle de tus pedidos realizados.</p>
          </div>
          <Link
            href="/profile"
            className="btn btn-ghost"
          >
            Volver al perfil
          </Link>
        </div>

        {orders.length === 0 && (
          <div className="panel text-center text-muted">
            Aún no tienes compras registradas.
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => {
            const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
            const isFocused = focusOrderId === order.id;
            return (
              <div
                key={order.id}
                id={`order-${order.id}`}
                className={` border ${
                  isFocused ? 'border-accent' : 'border-line'
                } bg-surface  p-6 md:p-8`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted">Orden</p>
                    <p className="price text-4xl text-accent">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Estado</p>
                    <span className="badge badge-ok">
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Fecha</p>
                    <p className="text-sm font-semibold text-fg-soft">
                      {new Date(order.createdAt).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-2  p-4 border border-line">
                    <p className="text-xs text-muted">Contacto</p>
                    {(order.customerFirstName || order.customerLastName) && (
                      <p className="text-sm font-semibold text-fg-soft">
                        {`${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim()}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-fg-soft">{order.customerEmail}</p>
                    {order.customerPhone && (
                      <p className="text-sm text-muted">{order.customerPhone}</p>
                    )}
                  </div>
                  <div className="bg-surface-2  p-4 border border-line">
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
                  <div className="bg-surface-2  p-4 border border-line mb-6">
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

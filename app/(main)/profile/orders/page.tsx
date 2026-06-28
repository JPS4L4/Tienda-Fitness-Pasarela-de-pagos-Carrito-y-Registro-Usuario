import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mis Compras | Fitness Studio',
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900">Mis Compras</h1>
            <p className="text-slate-600 mt-2">Consulta el detalle de tus pedidos realizados.</p>
          </div>
          <Link
            href="/profile"
            className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Volver al perfil
          </Link>
        </div>

        {orders.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
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
                className={`rounded-3xl border ${
                  isFocused ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200'
                } bg-white shadow-lg p-6 md:p-8`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-slate-500">Orden</p>
                    <p className="text-2xl font-bold text-indigo-600">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Estado</p>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Fecha</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(order.createdAt).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-500">Contacto</p>
                    {(order.customerFirstName || order.customerLastName) && (
                      <p className="text-sm font-semibold text-slate-700">
                        {`${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim()}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-slate-700">{order.customerEmail}</p>
                    {order.customerPhone && (
                      <p className="text-sm text-slate-600">{order.customerPhone}</p>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-500">Pago</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {order.paymentMethod || '—'}
                    </p>
                    {order.paymentId && (
                      <p className="text-sm text-slate-600">ID: {order.paymentId}</p>
                    )}
                  </div>
                </div>

                {(order.shippingAddress || order.shippingCity || order.shippingState || order.shippingPostalCode) && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                    <p className="text-xs text-slate-500">Envío</p>
                    <p className="text-sm text-slate-700">
                      {order.shippingAddress}
                      {order.shippingCity ? `, ${order.shippingCity}` : ''}
                      {order.shippingState ? `, ${order.shippingState}` : ''}
                      {order.shippingPostalCode ? ` (${order.shippingPostalCode})` : ''}
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-3">Detalle de compra</p>
                  {items.length > 0 ? (
                    <ul className="space-y-3">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between gap-3 text-sm">
                          <div className="text-slate-700">
                            {item.title || (item.type === 'plan' ? 'Plan' : 'Producto')}
                            {item.quantity ? ` x${item.quantity}` : ''}
                          </div>
                          <div className="font-semibold text-slate-700">
                            ${((item.unit_price ?? item.price) || 0).toLocaleString('es-CO')}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600">Sin detalle disponible.</p>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-200 mt-4 pt-4">
                    <span className="text-sm font-semibold text-slate-700">Total</span>
                    <span className="text-base font-bold text-slate-900">
                      ${order.totalAmount.toLocaleString('es-CO')}
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

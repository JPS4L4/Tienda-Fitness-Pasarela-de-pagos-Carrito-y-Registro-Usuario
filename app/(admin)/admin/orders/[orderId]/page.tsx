import Link from 'next/link'

async function fetchOrder(orderId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/admin/orders/${orderId}`, {
    cache: 'no-store',
  })
  return response.json()
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const data = await fetchOrder(orderId)

  if (data?.error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Orden no encontrada</h2>
          <p className="mt-2 text-slate-600">{data.error}</p>
          <Link
            href="/admin/orders"
            className="mt-6 inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Volver a órdenes
          </Link>
        </div>
      </main>
    )
  }

  const order = data.order

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Orden</p>
          <h2 className="text-3xl font-semibold text-slate-900">#{order.id}</h2>
        </div>
        <Link
          href="/admin/orders"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Volver a órdenes
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Resumen</h3>
          <dl className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <dt>Estado</dt>
              <dd className="font-semibold">{order.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Total</dt>
              <dd className="font-semibold">${Number(order.totalAmount).toLocaleString('es-CO')}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Método de pago</dt>
              <dd>{order.paymentMethod || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>ID de pago</dt>
              <dd className="text-xs text-slate-500">{order.paymentId || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Fecha</dt>
              <dd>{new Date(order.createdAt).toLocaleString('es-CO')}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Cliente</h3>
          <dl className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <dt>Nombre</dt>
              <dd>
                {order.customerFirstName || order.customerLastName
                  ? `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim()
                  : '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Email</dt>
              <dd>{order.customerEmail || order.user?.email || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Teléfono</dt>
              <dd>{order.customerPhone || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Usuario</dt>
              <dd>{order.user?.name || '—'} (ID {order.user?.id || '—'})</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">Items</h3>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(order.items, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  )
}

import { formatPrice } from '@/lib/money'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/requireAdmin'
import OrderFulfillment from '@/components/orders/OrderFulfillment'
import { getOrderFulfillment } from '@/lib/orders/shipping'
import { demoLast4, describePaymentMethod, getOrderStatusView } from '@/lib/orders/status'

async function fetchOrder(orderId: string) {
  // Consulta directa en el servidor: un fetch interno no llevaría la cookie de sesión.
  const admin = await getAdminSession()
  if (!admin) return { error: 'Acceso restringido' as const, order: null }

  const id = Number(orderId)
  if (!Number.isInteger(id)) return { error: 'ID inválido' as const, order: null }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  if (!order) return { error: 'Orden no encontrada' as const, order: null }
  return { error: null, order }
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const data = await fetchOrder(orderId)

  if (data.error !== null) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className=" border border-line bg-surface p-6 ">
          <h2 className="text-2xl font-semibold text-fg">Orden no encontrada</h2>
          <p className="mt-2 text-muted">{data.error}</p>
          <Link
            href="/admin/orders"
            className="mt-6 inline-flex items-center  border border-line px-4 py-2 text-sm text-fg-soft hover:bg-surface-2"
          >
            Volver a órdenes
          </Link>
        </div>
      </main>
    )
  }

  const order = data.order
  const statusView = getOrderStatusView(order.status)
  const fulfillment = getOrderFulfillment(order)

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow">Orden</p>
          <h2 className="text-5xl text-fg">#{order.id}</h2>
        </div>
        <Link
          href="/admin/orders"
          className=" border border-line px-4 py-2 text-sm text-fg-soft hover:bg-surface-2"
        >
          Volver a órdenes
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <h3 className="text-lg font-semibold text-fg">Resumen</h3>
          <dl className="mt-4 space-y-2 text-sm text-fg-soft">
            <div className="flex justify-between">
              <dt>Estado</dt>
              <dd className="font-semibold">
                {statusView.label} <span className="text-xs font-normal text-muted">({order.status})</span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Total</dt>
              <dd className="font-semibold">{formatPrice(Number(order.totalAmount))}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Método de pago</dt>
              <dd>{describePaymentMethod(order.paymentMethod, demoLast4(order.paymentId))}</dd>
            </div>
            <div className="flex justify-between">
              <dt>ID de pago</dt>
              <dd className="text-xs text-muted">{order.paymentId || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Fecha</dt>
              <dd>{new Date(order.createdAt).toLocaleString('es-CO')}</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <h3 className="text-lg font-semibold text-fg">Cliente</h3>
          <dl className="mt-4 space-y-2 text-sm text-fg-soft">
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

        {fulfillment && (
          <section className="lg:col-span-2">
            <OrderFulfillment fulfillment={fulfillment} />
          </section>
        )}

        <section className=" border border-line bg-surface p-6  lg:col-span-2">
          <h3 className="text-lg font-semibold text-fg">Items</h3>
          <pre className="mt-4 whitespace-pre-wrap  bg-surface p-4 text-xs text-fg-soft">
            {JSON.stringify(order.items, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'

type SalesEntry = {
  id: number
  title?: string
  quantity: number
  revenue: number
}

type SalesResponse = {
  totals: { totalRevenue: number; totalOrders: number }
  statusCounts: Record<string, number>
  pendingOrders: {
    id: number
    status: string
    totalAmount: number
    customerEmail: string | null
    createdAt: string
  }[]
  cancelledOrders: {
    id: number
    status: string
    totalAmount: number
    customerEmail: string | null
    createdAt: string
  }[]
  topItems: SalesEntry[]
  topPlans: SalesEntry[]
}

export default function SalesOverview() {
  const [data, setData] = useState<SalesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/sales')
        const payload = await response.json()
        setData(payload)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las ventas.')
      } finally {
        setLoading(false)
      }
    }

    loadSales()
  }, [])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Ventas</h2>
          <p className="text-sm text-slate-500">Resumen de productos y planes más vendidos.</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando ventas...</p>
        ) : error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Ingresos totales</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  ${data.totals.totalRevenue.toLocaleString('es-CO')}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Órdenes completadas</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {data.totals.totalOrders}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Pendientes</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {data.statusCounts?.PENDING || data.statusCounts?.pending || 0}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Canceladas</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {(data.statusCounts?.CANCELLED || 0) + (data.statusCounts?.cancelled || 0) + (data.statusCounts?.CANCELED || 0) + (data.statusCounts?.canceled || 0)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total estados</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {Object.values(data.statusCounts || {}).reduce((acc, val) => acc + val, 0)}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase">Top Items</h3>
                {data.topItems.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No hay ventas de items.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {data.topItems.map((item) => (
                      <li key={item.id} className="rounded-lg border border-slate-100 p-3">
                        <p className="font-medium text-slate-900">{item.title || `Item #${item.id}`}</p>
                        <p className="text-xs text-slate-500">Cantidad: {item.quantity}</p>
                        <p className="text-xs text-slate-500">Revenue: ${item.revenue.toLocaleString('es-CO')}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase">Top Planes</h3>
                {data.topPlans.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No hay ventas de planes.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {data.topPlans.map((plan) => (
                      <li key={plan.id} className="rounded-lg border border-slate-100 p-3">
                        <p className="font-medium text-slate-900">{plan.title || `Plan #${plan.id}`}</p>
                        <p className="text-xs text-slate-500">Cantidad: {plan.quantity}</p>
                        <p className="text-xs text-slate-500">Revenue: ${plan.revenue.toLocaleString('es-CO')}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase">Órdenes pendientes</h3>
                {data.pendingOrders.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No hay órdenes pendientes.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {data.pendingOrders.map((order) => (
                      <li key={order.id} className="rounded-lg border border-slate-100 p-3">
                        <p className="font-medium text-slate-900">
                          <a href={`/admin/orders/${order.id}`} className="text-teal-600 hover:underline">
                            Orden #{order.id}
                          </a>
                        </p>
                        <p className="text-xs text-slate-500">Email: {order.customerEmail || '—'}</p>
                        <p className="text-xs text-slate-500">Total: ${order.totalAmount.toLocaleString('es-CO')}</p>
                        <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString('es-CO')}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase">Órdenes canceladas</h3>
                {data.cancelledOrders.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No hay órdenes canceladas.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {data.cancelledOrders.map((order) => (
                      <li key={order.id} className="rounded-lg border border-slate-100 p-3">
                        <p className="font-medium text-slate-900">
                          <a href={`/admin/orders/${order.id}`} className="text-teal-600 hover:underline">
                            Orden #{order.id}
                          </a>
                        </p>
                        <p className="text-xs text-slate-500">Email: {order.customerEmail || '—'}</p>
                        <p className="text-xs text-slate-500">Total: ${order.totalAmount.toLocaleString('es-CO')}</p>
                        <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString('es-CO')}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

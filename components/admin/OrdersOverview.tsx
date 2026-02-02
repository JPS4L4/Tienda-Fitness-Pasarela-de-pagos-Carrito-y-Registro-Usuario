'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type OrderRow = {
  id: number
  status: string
  totalAmount: number
  customerEmail: string | null
  customerFirstName: string | null
  customerLastName: string | null
  paymentMethod: string | null
  paymentId: string | null
  planId: number | null
  createdAt: string
}

export default function OrdersOverview() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/orders')
        const data = await response.json()
        setOrders(data.orders || [])
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las órdenes.')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Órdenes</h2>
          <p className="text-sm text-slate-500">Listado general de órdenes.</p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando órdenes...</p>
        ) : error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-slate-500">No hay órdenes aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Orden</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Pago</th>
                  <th className="pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-teal-600 hover:underline"
                      >
                        #{order.id}
                      </Link>
                      {order.planId && (
                        <p className="text-xs text-slate-500">Plan #{order.planId}</p>
                      )}
                    </td>
                    <td className="py-3">
                      <p className="text-slate-900">
                        {order.customerFirstName || order.customerLastName
                          ? `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim()
                          : 'Cliente'}
                      </p>
                      <p className="text-xs text-slate-500">{order.customerEmail || '—'}</p>
                    </td>
                    <td className="py-3 text-slate-700">{order.status}</td>
                    <td className="py-3 text-slate-700">
                      ${order.totalAmount.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 text-slate-700">
                      <p>{order.paymentMethod || '—'}</p>
                      <p className="text-xs text-slate-500">{order.paymentId || '—'}</p>
                    </td>
                    <td className="py-3 text-slate-700">
                      {new Date(order.createdAt).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

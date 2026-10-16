'use client'

import { formatPrice } from '@/lib/money'

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
    <section className="panel">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-fg">Órdenes</h2>
          <p className="text-sm text-muted">Listado general de órdenes.</p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Cargando órdenes...</p>
        ) : error ? (
          <p className=" bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted">No hay órdenes aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-subtle">
                <tr>
                  <th className="pb-3 pr-4 font-bold">Orden</th>
                  <th className="pb-3 pr-4 font-bold">Cliente</th>
                  <th className="pb-3 pr-4 font-bold">Estado</th>
                  <th className="pb-3 pr-4 font-bold">Total</th>
                  <th className="pb-3 pr-4 font-bold">Pago</th>
                  <th className="pb-3 pr-4 font-bold">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-accent hover:underline"
                      >
                        #{order.id}
                      </Link>
                      {order.planId && (
                        <p className="text-xs text-muted">Plan #{order.planId}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-fg">
                        {order.customerFirstName || order.customerLastName
                          ? `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim()
                          : 'Cliente'}
                      </p>
                      <p className="text-xs text-muted">{order.customerEmail || '—'}</p>
                    </td>
                    <td className="py-3 pr-4 text-fg-soft">{order.status}</td>
                    <td className="py-3 pr-4 text-fg-soft">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-3 pr-4 text-fg-soft">
                      <p>{order.paymentMethod || '—'}</p>
                      <p className="text-xs text-muted">{order.paymentId || '—'}</p>
                    </td>
                    <td className="py-3 pr-4 text-fg-soft">
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

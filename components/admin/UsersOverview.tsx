'use client'

import { useEffect, useState } from 'react'

type UserRow = {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  emailVerified: string | null
  createdAt: string
  _count: { orders: number; subscriptions: number }
}

export default function UsersOverview() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/users')
        const data = await response.json()
        setUsers(data.users || [])
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los usuarios.')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Usuarios</h2>
          <p className="text-sm text-slate-500">Listado con información básica.</p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando usuarios...</p>
        ) : error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">No hay usuarios todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Usuario</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Teléfono</th>
                  <th className="pb-3">Órdenes</th>
                  <th className="pb-3">Suscripciones</th>
                  <th className="pb-3">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3">
                      <p className="font-medium text-slate-900">
                        {user.name || 'Sin nombre'}
                      </p>
                      <p className="text-xs text-slate-500">ID: {user.id}</p>
                    </td>
                    <td className="py-3 text-slate-700">{user.email || '—'}</td>
                    <td className="py-3 text-slate-700">{user.phone || '—'}</td>
                    <td className="py-3 text-slate-700">{user._count.orders}</td>
                    <td className="py-3 text-slate-700">{user._count.subscriptions}</td>
                    <td className="py-3 text-slate-700">
                      {new Date(user.createdAt).toLocaleDateString('es-CO')}
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

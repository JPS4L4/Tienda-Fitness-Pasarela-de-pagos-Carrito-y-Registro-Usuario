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
    <section className="panel">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-fg">Usuarios</h2>
          <p className="text-sm text-muted">Listado con información básica.</p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Cargando usuarios...</p>
        ) : error ? (
          <p className=" bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted">No hay usuarios todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-subtle">
                <tr>
                  <th className="pb-3 pr-4 font-bold">Usuario</th>
                  <th className="pb-3 pr-4 font-bold">Email</th>
                  <th className="pb-3 pr-4 font-bold">Teléfono</th>
                  <th className="pb-3 pr-4 font-bold">Órdenes</th>
                  <th className="pb-3 pr-4 font-bold">Suscripciones</th>
                  <th className="pb-3 pr-4 font-bold">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-fg">
                        {user.name || 'Sin nombre'}
                      </p>
                      <p className="text-xs text-muted">ID: {user.id}</p>
                    </td>
                    <td className="py-3 pr-4 text-fg-soft">{user.email || '—'}</td>
                    <td className="py-3 pr-4 text-fg-soft">{user.phone || '—'}</td>
                    <td className="py-3 pr-4 text-fg-soft">{user._count.orders}</td>
                    <td className="py-3 pr-4 text-fg-soft">{user._count.subscriptions}</td>
                    <td className="py-3 pr-4 text-fg-soft">
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

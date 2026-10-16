import UsersOverview from '@/components/admin/UsersOverview'

export default function AdminUsersPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-10">
      <div className="mb-8">
        <p className="eyebrow">Admin</p>
        <h2 className="text-5xl text-fg">Usuarios</h2>
        <p className="text-muted">Listado básico de usuarios registrados.</p>
      </div>
      <UsersOverview />
    </main>
  )
}

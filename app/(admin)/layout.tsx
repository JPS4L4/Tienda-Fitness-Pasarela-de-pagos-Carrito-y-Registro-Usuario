import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/nextAuth'

const getAdminEmails = () =>
  process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()).filter(Boolean) ?? []

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  const adminEmails = getAdminEmails()
  const isAdmin = adminEmails.length === 0 || adminEmails.includes(session.user.email)

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Acceso restringido</h1>
            <p className="mt-2 text-slate-600">
              Tu cuenta no tiene permisos de administrador.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Panel Admin</p>
            <Link href="/" className="text-xl font-semibold text-slate-900">NanSalazar</Link>
          </div>
          <nav className="flex gap-3 text-sm text-slate-600">
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-50" href="/">
              🏠Inicio
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-50" href="/admin">
              🎛️Dashboard
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-50" href="/admin/items">
               🛒Items
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-50" href="/admin/orders">
               📋Ordenes
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-50" href="/admin/plans">
               🏋️Planes
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-50" href="/admin/users">
               👥Usuarios
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-50" href="/admin/sales">
               💰Ventas
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}

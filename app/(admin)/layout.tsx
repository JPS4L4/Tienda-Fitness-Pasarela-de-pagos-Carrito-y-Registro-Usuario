import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/nextAuth'
import { isAdminEmail } from '@/lib/adminAuth'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main className="min-h-screen bg-bg">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="panel border-t-4 border-t-danger">
            <h1 className="text-4xl text-fg">Acceso restringido</h1>
            <p className="mt-3 text-muted">Tu cuenta no tiene permisos de administrador.</p>
            <Link href="/" className="btn btn-secondary mt-6">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="container mx-auto flex flex-col gap-2 px-4 pt-4 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="flex items-baseline gap-4 pb-2">
            <Link href="/" className="font-display text-2xl uppercase leading-none text-fg hover:text-accent">
              Fitness Studio
            </Link>
            <span className="badge badge-accent">Admin</span>
          </div>
          <AdminNav />
        </div>
      </header>
      {children}
    </div>
  )
}

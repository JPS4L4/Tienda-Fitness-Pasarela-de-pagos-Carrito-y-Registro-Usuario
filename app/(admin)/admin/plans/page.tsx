import PlansCrud from '@/components/admin/PlansCrud'
import { isReadOnlyAdminSession } from '@/lib/requireAdmin'

export default async function AdminPlansPage() {
  const readOnly = await isReadOnlyAdminSession()

  return (
    <main className="container mx-auto px-4 py-8 md:py-10">
      <div className="mb-8">
        <p className="eyebrow">Admin</p>
        <h2 className="text-5xl text-fg">Planes</h2>
        <p className="text-muted">Estructura base para el CRUD de planes.</p>
      </div>
      <PlansCrud readOnly={readOnly} />
    </main>
  )
}

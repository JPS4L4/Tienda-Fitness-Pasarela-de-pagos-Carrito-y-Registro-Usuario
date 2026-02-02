import SalesOverview from '@/components/admin/SalesOverview'

export default function AdminSalesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p>
        <h2 className="text-3xl font-semibold text-slate-900">Ventas</h2>
        <p className="text-slate-600">Resumen de ventas y productos más vendidos.</p>
      </div>
      <SalesOverview />
    </main>
  )
}

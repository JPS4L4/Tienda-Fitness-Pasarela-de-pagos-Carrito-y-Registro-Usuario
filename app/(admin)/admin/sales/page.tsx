import SalesOverview from '@/components/admin/SalesOverview'

export default function AdminSalesPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-10">
      <div className="mb-8">
        <p className="eyebrow">Admin</p>
        <h2 className="text-5xl text-fg">Ventas</h2>
        <p className="text-muted">Resumen de ventas y productos más vendidos.</p>
      </div>
      <SalesOverview />
    </main>
  )
}

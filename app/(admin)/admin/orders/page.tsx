import OrdersOverview from '@/components/admin/OrdersOverview'

export default function AdminOrdersPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-10">
      <div className="mb-8">
        <p className="eyebrow">Admin</p>
        <h2 className="text-5xl text-fg">Órdenes</h2>
        <p className="text-muted">Listado completo y acceso al detalle.</p>
      </div>
      <OrdersOverview />
    </main>
  )
}

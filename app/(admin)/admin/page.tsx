import Link from 'next/link'

export default function AdminHomePage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-10">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">Dashboard</p>
        <h2 className="text-5xl text-fg">Panel administrativo</h2>
        <p className="text-muted">
          Gestiona productos, planes, usuarios, órdenes y ventas de la tienda.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/items"
          className="group border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <h3 className="text-3xl text-fg">CRUD de Items</h3>
          <p className="mt-2 text-sm text-muted">
            Crea, edita y elimina productos. Ajusta precios, stock y etiquetas.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-accent">
            Administrar items &rarr;
          </span>
        </Link>

        <Link
          href="/admin/plans"
          className="group border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <h3 className="text-3xl text-fg">CRUD de Planes</h3>
          <p className="mt-2 text-sm text-muted">
            Administra planes de nutrición y entrenamiento, cobertura y pricing.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-accent">
            Administrar planes &rarr;
          </span>
        </Link>

        <Link
          href="/admin/users"
          className="group border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <h3 className="text-3xl text-fg">Usuarios</h3>
          <p className="mt-2 text-sm text-muted">
            Revisa usuarios registrados, órdenes y suscripciones.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-accent">
            Ver usuarios &rarr;
          </span>
        </Link>

        <Link
          href="/admin/sales"
          className="group border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <h3 className="text-3xl text-fg">Ventas</h3>
          <p className="mt-2 text-sm text-muted">
            Resumen de ventas y productos más vendidos.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-accent">
            Ver ventas &rarr;
          </span>
        </Link>

        <Link
          href="/admin/orders"
          className="group border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <h3 className="text-3xl text-fg">Órdenes</h3>
          <p className="mt-2 text-sm text-muted">
            Revisa el listado y el detalle de cada orden.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-accent">
            Ver órdenes &rarr;
          </span>
        </Link>
      </div>
    </main>
  )
}

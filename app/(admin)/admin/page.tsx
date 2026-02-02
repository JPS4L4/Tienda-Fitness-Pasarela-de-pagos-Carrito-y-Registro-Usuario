import Link from 'next/link'

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
        <h2 className="text-3xl font-semibold text-slate-900">Panel administrativo</h2>
        <p className="text-slate-600">
          Desde aquí podrás gestionar items y planes. Este es el primer borrador del CRUD.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/items"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold text-slate-900">CRUD de Items</h3>
          <p className="mt-2 text-sm text-slate-600">
            Crea, edita y elimina productos. Ajusta precios, stock y etiquetas.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-teal-600">
            Administrar items →
          </span>
        </Link>

        <Link
          href="/admin/plans"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold text-slate-900">CRUD de Planes</h3>
          <p className="mt-2 text-sm text-slate-600">
            Administra planes de nutrición y entrenamiento, cobertura y pricing.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-teal-600">
            Administrar planes →
          </span>
        </Link>

        <Link
          href="/admin/users"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold text-slate-900">Usuarios</h3>
          <p className="mt-2 text-sm text-slate-600">
            Revisa usuarios registrados, órdenes y suscripciones.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-teal-600">
            Ver usuarios →
          </span>
        </Link>

        <Link
          href="/admin/sales"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold text-slate-900">Ventas</h3>
          <p className="mt-2 text-sm text-slate-600">
            Resumen de ventas y productos más vendidos.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-teal-600">
            Ver ventas →
          </span>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold text-slate-900">Órdenes</h3>
          <p className="mt-2 text-sm text-slate-600">
            Revisa el listado y el detalle de cada orden.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-teal-600">
            Ver órdenes →
          </span>
        </Link>
      </div>
    </main>
  )
}

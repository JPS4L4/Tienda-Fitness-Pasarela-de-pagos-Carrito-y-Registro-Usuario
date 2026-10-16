import { formatPrice } from '@/lib/money'
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mis Planes',
  description: 'Planes adquiridos por el usuario',
};

type OrderItem = {
  type?: string;
  planId?: number;
  title?: string;
  price?: number;
  subscriptionType?: string;
};

export default async function PlansPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = parseInt(session.user.id, 10);

  const orders = await prisma.order.findMany({
    where: {
      userId,
      OR: [{ planId: { not: null } }],
    },
    orderBy: { createdAt: 'desc' },
  });

  const plans = orders.map((order) => {
    const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
    const planItem = items.find((item) => item.type === 'plan' || item.planId);
    return {
      orderId: order.id,
      planId: order.planId || planItem?.planId,
      title: planItem?.title || 'Plan de entrenamiento',
      subscriptionType: order.subscriptionType || planItem?.subscriptionType,
      price: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
    };
  });

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl text-fg">Mis Planes</h1>
            <p className="text-muted mt-2">Planes activos y compras relacionadas.</p>
          </div>
          <Link
            href="/profile"
            className="btn btn-ghost"
          >
            Volver al perfil
          </Link>
        </div>

        {plans.length === 0 && (
          <div className="panel text-center text-muted">
            Aún no tienes planes registrados.
          </div>
        )}

        <div className="space-y-6">
          {plans.map((plan) => (
            <div key={plan.orderId} className="border border-line bg-surface p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted">Plan</p>
                  <p className="price text-4xl text-fg">{plan.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Estado</p>
                  <span className="badge badge-ok">
                    {plan.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted">Fecha</p>
                  <p className="text-sm font-semibold text-fg-soft">
                    {new Date(plan.createdAt).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-2  p-4 border border-line">
                  <p className="text-xs text-muted">Tipo de suscripción</p>
                  <p className="text-sm font-semibold text-fg-soft">
                    {plan.subscriptionType || 'No definido'}
                  </p>
                </div>
                <div className="bg-surface-2  p-4 border border-line">
                  <p className="text-xs text-muted">Monto</p>
                  <p className="text-sm font-semibold text-fg-soft">
                    {formatPrice(plan.price)}
                  </p>
                </div>
              </div>

              {plan.planId && (
                <div className="mt-4 text-sm text-muted">
                  ID del plan: <span className="font-semibold text-fg-soft">{plan.planId}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

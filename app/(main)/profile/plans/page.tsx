import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mis Planes | Nan Salazar',
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900">Mis Planes</h1>
            <p className="text-slate-600 mt-2">Planes activos y compras relacionadas.</p>
          </div>
          <Link
            href="/profile"
            className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Volver al perfil
          </Link>
        </div>

        {plans.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
            Aún no tienes planes registrados.
          </div>
        )}

        <div className="space-y-6">
          {plans.map((plan) => (
            <div key={plan.orderId} className="rounded-3xl border border-slate-200 bg-white shadow-lg p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500">Plan</p>
                  <p className="text-2xl font-bold text-emerald-600">{plan.title}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Estado</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                    {plan.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Fecha</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(plan.createdAt).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Tipo de suscripción</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {plan.subscriptionType || 'No definido'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500">Monto</p>
                  <p className="text-sm font-semibold text-slate-700">
                    ${plan.price.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {plan.planId && (
                <div className="mt-4 text-sm text-slate-500">
                  ID del plan: <span className="font-semibold text-slate-700">{plan.planId}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

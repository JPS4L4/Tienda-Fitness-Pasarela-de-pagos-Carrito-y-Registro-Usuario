import type { Metadata } from 'next';
import { BRAND_NAME } from '@/lib/brand';
import { formatPrice, getPriceDisplay, PRICE_UNAVAILABLE } from '@/lib/money'
import { durationSuffix } from '@/lib/planDuration'
import { notFound } from 'next/navigation';
import { Check, ArrowRight, Apple, Dumbbell, Star, Tag } from 'lucide-react';
import { getPlanBySlug } from '@/app/src/lib/plans';
import { PlanUI } from '@/app/src/types/plan';
import { SafeImage } from '@/components/others/SafeImage';
import FavoritePlanButton from '@/components/buttons/FavoritePlanButton';
import Link from 'next/link';
import FitnessProfileGate from '@/components/others/FitnessProfileGate';
import PlanReviewsSection from '@/components/others/PlanReviewsSection';
import { Badge } from '@/components/ui/Badge';
import { auth } from '@/lib/nextAuth';
import { canViewPlanContent } from '@/lib/planAccess';

const TYPE_META = {
  nutricion: { Icon: Apple, typeLabel: 'Nutrición' },
  entrenamiento: { Icon: Dumbbell, typeLabel: 'Entrenamiento' },
};

interface PlanDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PlanDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const plan = await getPlanBySlug(slug);
  if (!plan) return { title: 'Plan no encontrado' };
  const description = plan.shortDescription || plan.description || `${plan.title} en ${BRAND_NAME}`;
  const images = plan.image ? [{ url: plan.image }] : undefined;
  return {
    title: plan.title,
    description,
    openGraph: { title: plan.title, description, type: 'website', images },
    twitter: { card: 'summary_large_image', title: plan.title, description, images: plan.image ? [plan.image] : undefined },
  };
};

const PlanDetailPage = async ({ params }: PlanDetailPageProps) => {
  const { slug } = await params;
  const session = await auth();
  // Primero sin contenido; el contenido de pago solo se pide si hay acceso.
  const publicPlan: PlanUI | null = await getPlanBySlug(slug);

  if (!publicPlan) {
    notFound();
  }

  const hasContentAccess = await canViewPlanContent(session, publicPlan.id);
  const plan: PlanUI = hasContentAccess
    ? (await getPlanBySlug(slug, { includeContent: true })) ?? publicPlan
    : publicPlan;

  const meta = TYPE_META[plan.type as keyof typeof TYPE_META] || TYPE_META.nutricion;
  const { Icon } = meta;
  const { valid: hasValidPrice, final: precioFinal, previous: precioAnterior, badge } = getPriceDisplay(plan);

  return (
    <div className="min-h-screen bg-bg">
      <FitnessProfileGate />
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Imagen: proporción fija 4:3 */}
          <div className="media aspect-[4/3] border border-line lg:sticky lg:top-24">
            <SafeImage
              src={plan.image}
              alt={plan.title}
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              fallback={<Icon className="h-16 w-16 text-accent" aria-hidden="true" />}
            />
            <div className="pointer-events-none absolute left-0 top-0 flex flex-col items-start gap-1">
              <Badge tone="accent" className="px-3 py-2 text-sm">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {meta.typeLabel}
              </Badge>
              {badge && <Badge className="bg-bg px-3 py-2 text-sm text-fg">-{badge}% OFF</Badge>}
            </div>
          </div>

          {/* Contenido */}
          <div className="flex flex-col">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h1 className="text-5xl leading-[0.95] text-fg md:text-6xl lg:text-7xl">{plan.title}</h1>
              <FavoritePlanButton id={plan.id} title={plan.title} image={plan.image} slug={plan.slug} />
            </div>

            {plan.rating !== undefined && plan.reviewCount !== undefined && (
              <div className="mb-5 flex items-center gap-3">
                <div className="flex items-center gap-1" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(plan.rating!) ? 'fill-accent text-accent' : 'text-line-strong'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-fg">
                  {plan.rating.toFixed(1)} <span className="font-medium text-muted">({plan.reviewCount} reseñas)</span>
                </span>
              </div>
            )}

            {plan.shortDescription && (
              <p className="mb-6 text-xl leading-relaxed text-fg-soft">{plan.shortDescription}</p>
            )}

            <div className="mb-6 border-y border-line py-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                {hasValidPrice ? (
                  <>
                    <p className="price text-6xl text-fg md:text-7xl">{formatPrice(precioFinal, plan.currency)}</p>
                    <span className="text-sm font-bold uppercase tracking-[0.14em] text-muted">{plan.currency} {durationSuffix(plan.durationType)}</span>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-muted">{PRICE_UNAVAILABLE}</p>
                )}
              </div>
              {precioAnterior && (
                <p className="mt-2 text-xl text-muted line-through">{formatPrice(precioAnterior, plan.currency)}</p>
              )}
            </div>

            {plan.tags && plan.tags.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {plan.tags.map((tag, index) => (
                  <Badge key={index} tone="outline" className="px-3 py-2">
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mb-10">
              <h2 className="mb-5 text-3xl">Lo que incluye</h2>
              <ul className="grid gap-px border border-line bg-line">
                {plan.coverage.map((item, index) => (
                  <li key={index} className="flex items-start gap-4 bg-surface p-4">
                    <Check className="mt-0.5 h-6 w-6 shrink-0 text-accent" strokeWidth={3} aria-hidden="true" />
                    <span className="text-lg leading-snug text-fg-soft">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {hasValidPrice ? (
              <Link href={`/checkout?type=plan&planId=${plan.id}`} className="btn btn-primary btn-lg w-full sm:w-auto">
                Contratar plan ahora
                <ArrowRight className="h-6 w-6" aria-hidden="true" />
              </Link>
            ) : (
              <button type="button" disabled className="btn btn-primary btn-lg w-full sm:w-auto">
                No disponible
              </button>
            )}

            <p className="mt-5 text-sm text-muted">Comienza tu transformación hoy. Soporte personalizado incluido.</p>

            {plan.description && (
              <div className="mt-12 border-t border-line pt-10">
                <h2 className="mb-4 text-3xl">Descripción completa</h2>
                <p className="whitespace-pre-line leading-relaxed text-fg-soft">{plan.description}</p>
              </div>
            )}

            {plan.content && (
              <div className="mt-8">
                <h2 className="mb-4 text-3xl">Contenido del plan</h2>
                <div className="max-w-none text-fg-soft">{plan.content}</div>
              </div>
            )}
          </div>
        </div>
        <PlanReviewsSection planId={plan.id} />
      </div>
    </div>
  );
}

export default PlanDetailPage;

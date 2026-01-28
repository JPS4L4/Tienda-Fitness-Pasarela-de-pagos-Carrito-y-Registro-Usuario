import { notFound } from 'next/navigation';
import { CheckCircle, Sparkles, Apple, Dumbbell, Star, Tag, Heart } from 'lucide-react';
import { getPlanBySlug } from '@/app/src/lib/plans';
import { PlanUI } from '@/app/src/types/plan';
import { SafeImage } from '@/components/others/SafeImage';
import FavoritePlanButton from '@/components/buttons/FavoritePlanButton';
import Link from 'next/link';

// Definimos los estilos por tipo
const planStyles = {
  nutricion: {
    bgGradient: 'from-green-50 to-emerald-50',
    text: 'text-green-700',
    accent: 'text-green-600',
    badge: 'bg-green-100 text-green-700 border-green-200',
    buttonFrom: 'from-green-600',
    buttonTo: 'to-emerald-600',
    buttonHoverFrom: 'from-green-500',
    buttonHoverTo: 'to-emerald-500',
    icon: <Apple className="w-8 h-8 text-green-600" />,
    typeLabel: 'Nutrición',
  },
  entrenamiento: {
    bgGradient: 'from-blue-50 to-indigo-50',
    text: 'text-blue-700',
    accent: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    buttonFrom: 'from-blue-600',
    buttonTo: 'to-indigo-600',
    buttonHoverFrom: 'from-blue-500',
    buttonHoverTo: 'to-indigo-500',
    icon: <Dumbbell className="w-8 h-8 text-blue-600" />,
    typeLabel: 'Entrenamiento',
  },
};

interface PlanDetailPageProps {
  params: Promise<{ slug: string }>;
}

const PlanDetailPage = async ({ params }: PlanDetailPageProps) => {
  const { slug } = await params;
  const plan: PlanUI | null = await getPlanBySlug(slug);

  if (!plan) {
    notFound();
  }

  // Seleccionamos los estilos según el tipo
  const style = planStyles[plan.type as keyof typeof planStyles] || planStyles.nutricion;

  const precioFinal = plan.discount && plan.discount > 0
    ? Math.round(plan.price * (1 - plan.discount / 100))
    : plan.price;

  console.log('Plan cargado:', { title: plan.title, slug: plan.slug, price: plan.price });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Lado izquierdo: Imagen */}
          <div className={`relative w-full h-full grid items-center rounded-2xl overflow-hidden shadow-2xl shadow-black/10 bg-gradient-to-br ${style.bgGradient}`}>
            {plan.image ? (
              <SafeImage
                src={plan.image}
                alt={plan.title}
                className="object-cover w-full h-full"
                containerClassName="aspect-[4/3]"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="aspect-[4/3] relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/30 to-transparent">
                  <div className="text-center p-8">
                    {style.icon}
                    <p className={`text-xl font-medium ${style.text} mt-4`}>
                      {style.typeLabel}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Badge de descuento */}
            {plan.discount && plan.discount > 0 && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
                  -{plan.discount}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Lado derecho: Contenido */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className={`inline-block px-4 py-1.5 ${style.badge} rounded-full text-sm font-semibold uppercase tracking-wide`}>
                  {style.typeLabel}
                </span>
                <FavoritePlanButton 
                  id={plan.id} 
                  title={plan.title} 
                  image={plan.image} 
                  slug={plan.slug} 
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                {plan.title}
              </h1>

              {/* Rating */}
              {plan.rating !== undefined && plan.reviewCount !== undefined && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(plan.rating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium">
                    {plan.rating.toFixed(1)} ({plan.reviewCount} reseñas)
                  </span>
                </div>
              )}

              {/* Short Description */}
              {plan.shortDescription && (
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {plan.shortDescription}
                </p>
              )}

              {/* Precio */}
              <div className="flex items-baseline gap-4">
                <p className={`text-4xl md:text-5xl font-black ${style.accent} tracking-tight`}>
                  ${precioFinal.toLocaleString('es-CO')}
                  <span className="text-xl font-medium text-gray-500 ml-2">
                    {plan.currency}
                  </span>
                </p>
                {plan.discount && plan.discount > 0 && (
                  <p className="text-2xl text-gray-500 line-through">
                    ${plan.price.toLocaleString('es-CO')}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            {plan.tags && plan.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {plan.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-1 px-3 py-1 ${style.badge} rounded-full text-sm font-medium`}
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Beneficios */}
            <div className="mb-10">
              <h2 className={`text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3`}>
                <CheckCircle className={`w-8 h-8 ${style.accent}`} />
                Lo que incluye
              </h2>
              <ul className="grid gap-4">
                {plan.coverage.map((item, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-4 bg-white/70 backdrop-blur-sm p-5 rounded-xl border ${style.badge.split(' ')[0]} hover:border-opacity-50 transition-all group`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <CheckCircle className={`w-6 h-6 ${style.accent}`} />
                    </div>
                    <span className="text-lg text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botón principal */}
            <Link
              type="button"
              className={`group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-r ${style.buttonFrom} ${style.buttonTo} text-white font-bold text-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95`}
              href={`/checkout?type=plan&planId=${plan.id}`}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Contratar Plan Ahora
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </span>
            </Link>

            <p className="mt-6 text-center sm:text-left text-gray-500 text-sm">
              Comienza tu transformación hoy • Soporte personalizado incluido
            </p>

            {/* Description completa */}
            {plan.description && (
              <div className="mt-12 pt-12 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción Completa</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {plan.description}
                </p>
              </div>
            )}

            {/* Content adicional */}
            {plan.content && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contenido del Plan</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  {plan.content}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanDetailPage;
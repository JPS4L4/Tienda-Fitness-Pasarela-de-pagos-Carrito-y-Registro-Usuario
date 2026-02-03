import { notFound } from 'next/navigation';
import { CreditCard, Star, Truck, Package, Tag } from 'lucide-react';
import { SafeImage } from '@/components/others/SafeImage';
import ItemClient from '@/components/others/ItemClient';
import { ItemUI } from '@/app/src/types/item';
import { getItemBySlug } from '../../../src/lib/items';
import { cn } from '@/lib/utils';
import FavoriteItemButton from '../../../../components/buttons/FavoriteItemButton';
import ProductReviewsSection from '@/components/others/ProductReviewsSection';

const ItemDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  const item: ItemUI | null = await getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const precioFinal = item.discount
    ? Math.round(item.price * (1 - item.discount / 100))
    : item.price;

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">

          {/* Columna izquierda - Imagen y badges */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/10 group bg-white">
              <SafeImage
                src={item.image || '/placeholder-product.jpg'}
                alt={item.title}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                containerClassName="aspect-[4/3] lg:aspect-square"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Badges debajo de la imagen */}
            <div className="flex flex-wrap gap-3">
              {item.isOfferOfTheDay && (
                <span className="inline-flex items-center gap-2 px-5 py-2 bg-linear-to-r from-orange-500 to-rose-500 text-white text-sm font-bold rounded-full shadow-sm">
                  <Star className="w-5 h-5 fill-white" />
                  Oferta del día
                </span>
              )}

              {item.discount && item.discount > 0 && (
                <span className="inline-flex items-center gap-2 px-5 py-2 bg-red-500 text-white text-sm font-bold rounded-full shadow-sm">
                  -{item.discount}% OFF
                </span>
              )}

              {item.freeShipping && (
                <span className="inline-flex items-center gap-2 px-5 py-2 bg-green-500 text-white text-sm font-bold rounded-full shadow-sm">
                  <Truck className="w-5 h-5" />
                  Envío Gratis
                </span>
              )}

              {item.stock !== undefined && (
                <span className={cn(
                  "inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold shadow-sm",
                  item.stock > 10 ? 'bg-green-100 text-green-800' :
                  item.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                )}>
                  <Package className="w-5 h-5" />
                  {item.stock > 0 ? `${item.stock} disponibles` : 'Agotado'}
                </span>
              )}
            </div>
          </div>

          {/* Columna derecha - Contenido */}
          <div className="flex flex-col space-y-8 lg:space-y-10">
            {/* Categoría */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-6 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold uppercase tracking-wide w-fit">
                {item.category}
              </span>
              <FavoriteItemButton
                id={item.id}
                title={item.title}
                image={item.image}
                slug={item.slug}
              />
            </div>

            {/* Título */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {item.title}
            </h1>

            {/* Rating */}
            {item.rating !== undefined && item.reviewCount !== undefined && (
              <div className="flex items-center gap-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-7 h-7 transition-colors",
                        i < Math.floor(item.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium text-gray-700">
                  {item.rating.toFixed(1)} <span className="text-gray-500">({item.reviewCount} reseñas)</span>
                </span>
              </div>
            )}

            {/* Precio */}
            <div className="flex flex-wrap items-baseline gap-4">
              <p className="text-5xl md:text-6xl font-black text-emerald-600 tracking-tight">
                ${precioFinal.toLocaleString('es-CO')}
              </p>

              {item.originalPrice && item.originalPrice > precioFinal && (
                <p className="text-3xl text-gray-400 line-through">
                  ${item.originalPrice.toLocaleString('es-CO')}
                </p>
              )}

              {item.discount && item.discount > 0 && (
                <span className="text-xl font-bold text-red-600 bg-red-50 px-4 py-1 rounded-full">
                  -{item.discount}% OFF
                </span>
              )}
            </div>

            {/* Cuotas y envío */}
            <div className="flex flex-wrap gap-6 text-lg">
              {item.installments && item.installments > 1 && (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                  <span className="font-medium text-gray-700">
                    Hasta {item.installments}x sin interés
                  </span>
                </div>
              )}

              {item.freeShipping && (
                <div className="flex items-center gap-2">
                  <Truck className="w-6 h-6 text-green-600" />
                  <span className="font-medium text-green-700">Envío gratis</span>
                </div>
              )}
            </div>

            {/* Short Description */}
            {item.shortDescription && (
              <p className="text-xl text-gray-700 leading-relaxed">
                {item.shortDescription}
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Acciones */}
            <div className="pt-6">
              <ItemClient producto={item} precioFinal={precioFinal} />
            </div>
          </div>
        </div>

        {/* Sección inferior simétrica */}
        {(item.description || (item.specs && Object.keys(item.specs).length > 0)) && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Descripción completa */}
            {item.description && (
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Descripción detallada</h2>
                <div className="prose prose-lg text-gray-700 max-w-none">
                  {item.description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Especificaciones */}
            {item.specs && Object.keys(item.specs).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Especificaciones</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Object.entries(item.specs).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-6 shadow-sm">
                      <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="text-lg text-gray-900 font-medium">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}
        <ProductReviewsSection productId={item.id} />
      </div>
    </div>
  );
};

export default ItemDetailPage;
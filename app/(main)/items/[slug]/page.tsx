import { notFound } from 'next/navigation';
import { CreditCard, Star, Truck, Heart, ShoppingCart, Package, Tag } from 'lucide-react';
import { SafeImage } from '@/components/others/SafeImage';
import ItemClient from '@/components/others/ItemClient';
import { ItemUI } from '@/app/src/types/item';
import { getItemBySlug } from '../../../src/lib/items';

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Imagen */}
          <div className="relative my-auto rounded-3xl overflow-hidden shadow-2xl shadow-black/10 group">
            <SafeImage
              src={item.image || ''}
              alt={item.title}
              className="object-cover group-hover:scale-105 transition-transform"
              containerClassName="aspect-square"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {item.isOfferOfTheDay && (
                <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                  <Star className="w-4 h-4 fill-white" />
                  Oferta del día
                </span>
              )}

              {item.discount && item.discount > 0 && (
                <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
                  -{item.discount}% OFF
                </span>
              )}

              {item.freeShipping && (
                <span className="bg-green-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  Envío Gratis
                </span>
              )}
            </div>

            {/* Stock badge */}
            {item.stock !== undefined && (
              <div className="absolute bottom-4 right-4 z-10">
                <span className={`px-4 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1 ${
                  item.stock > 10 ? 'bg-green-100 text-green-700' : 
                  item.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  <Package className="w-4 h-4" />
                  {item.stock > 0 ? `${item.stock} disponibles` : 'Agotado'}
                </span>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex flex-col">
            <span className="inline-block px-5 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold uppercase mb-4 w-fit">
              {item.category}
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              {item.title}
            </h1>

            {/* Rating */}
            {item.rating !== undefined && item.reviewCount !== undefined && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(item.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">
                  {item.rating.toFixed(1)} ({item.reviewCount} reseñas)
                </span>
              </div>
            )}

            {/* Short Description */}
            {item.shortDescription && (
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {item.shortDescription}
              </p>
            )}

            {/* Precio */}
            <div className="flex items-baseline gap-4 mb-8">
              <p className="text-5xl font-black text-green-600">
                ${precioFinal.toLocaleString('es-CO')}
              </p>

              {item.originalPrice && item.originalPrice > precioFinal && (
                <p className="text-2xl text-gray-500 line-through">
                  ${item.originalPrice.toLocaleString('es-CO')}
                </p>
              )}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <CreditCard className="w-8 h-8 text-indigo-600 mb-3" />
                <p className="font-semibold text-gray-700">
                  {item.installments
                    ? `Hasta ${item.installments} cuotas`
                    : 'Pago único'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <Truck className="w-8 h-8 text-green-600 mb-3" />
                <p className="font-semibold text-gray-700">
                  {item.freeShipping ? 'Envío gratis' : 'Envío estándar'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <Package className="w-8 h-8 text-blue-600 mb-3" />
                <p className="font-semibold text-gray-700">
                  {item.stock && item.stock > 0 ? 'En stock' : 'Consultar disponibilidad'}
                </p>
              </div>
            </div>

            <ItemClient producto={item} precioFinal={precioFinal} />

            {/* Description */}
            {item.description && (
              <div className="mt-12 pt-12 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            )}

            {/* Specs */}
            {item.specs && Object.keys(item.specs).length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Especificaciones</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                  {Object.entries(item.specs).map(([key, value]) => (
                    <div key={key} className="p-4 flex justify-between items-center">
                      <span className="font-semibold text-gray-700 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;

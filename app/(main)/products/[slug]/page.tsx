import { notFound } from 'next/navigation';
import { CreditCard, Star, Truck } from 'lucide-react';
import { SafeImage } from '@/components/others/SafeImage';
import ProductoClient from '@/components/others/ProductoClient';
import { ItemUI } from '@/app/src/types/item';
import { getItemBySlug } from '../../../src/lib/products'; 

interface ProductoPageProps {
  params: { slug: string };
}

const ProductoPage = async ({ params }: ProductoPageProps) => {
  const { slug } = params;

  const producto: ItemUI | null = await getItemBySlug(slug);

  if (!producto) {
    notFound();
  }

  const precioFinal = producto.discount
    ? Math.round(producto.price * (1 - producto.discount / 100))
    : producto.price;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Imagen */}
          <div className="relative my-auto rounded-3xl overflow-hidden shadow-2xl shadow-black/10 group">
            <SafeImage
              src={producto.image}
              alt={producto.title}
              className="object-cover group-hover:scale-105 transition-transform"
              containerClassName="aspect-square"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {producto.isOfferOfTheDay && (
                <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                  <Star className="w-4 h-4 fill-white" />
                  Oferta del día
                </span>
              )}

              {producto.discount || 0 > 0 && (
                <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
                  -{producto.discount}% OFF
                </span>
              )}

              {producto.freeShipping && (
                <span className="bg-green-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  Envío Gratis
                </span>
              )}
            </div>
          </div>

          {/* Contenido */}
          <div className="flex flex-col">
            <span className="inline-block px-5 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold uppercase mb-4">
              {producto.category}
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              {producto.title}
            </h1>

            {/* Precio */}
            <div className="flex items-baseline gap-4 mb-10">
              <p className="text-5xl font-black text-green-600">
                ${precioFinal.toFixed(0)}
              </p>

              {producto.originalPrice &&
                producto.originalPrice > precioFinal && (
                  <p className="text-2xl text-gray-500 line-through">
                    ${producto.originalPrice.toFixed(0)}
                  </p>
                )}
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <CreditCard className="w-8 h-8 text-indigo-600 mb-3" />
                <p className="font-semibold">
                  {producto.installments
                    ? `Hasta ${producto.installments} cuotas`
                    : 'Pago único'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <Truck className="w-8 h-8 text-green-600 mb-3" />
                <p className="font-semibold">
                  {producto.freeShipping ? 'Envío gratis' : 'Envío estándar'}
                </p>
              </div>

              {producto.isOfferOfTheDay && (
                <div className="bg-orange-50 p-6 rounded-2xl shadow-sm">
                  <Star className="w-8 h-8 text-orange-500 mb-3 fill-orange-500" />
                  <p className="font-semibold text-orange-700">
                    Oferta del día
                  </p>
                </div>
              )}
            </div>

            <ProductoClient producto={producto} precioFinal={precioFinal} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoPage;

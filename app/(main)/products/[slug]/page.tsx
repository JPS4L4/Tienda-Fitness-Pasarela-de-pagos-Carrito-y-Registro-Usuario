import { notFound } from 'next/navigation';
import { db, type ItemProps } from "@/app/data/data";
import { ShoppingCart, Truck, CreditCard, Star } from 'lucide-react';
import { SafeImage } from '@/components/SafeImage';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function getProductoPorSlug(slug: string): Promise<ItemProps | null> {
  const producto = db.items.find(
    (item) => generateSlug(item.title) === slug
  );
  return producto ?? null;
}

interface ProductoPageProps {
  params: Promise<{ slug: string }>;
}

const ProductoPage = async ({ params }: ProductoPageProps) => {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);

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
         {/* Lado izquierdo: Imagen principal */}
<div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/10 group">
    <SafeImage
    src={producto.image}
    alt={producto.title}
    className="object-cover group-hover:scale-105"     // zoom al hover
    containerClassName="aspect-square"                 // o aspect-[4/3], etc.
    priority={true}                                    // si es la imagen hero
    sizes="(max-width: 768px) 100vw, 50vw"             // responsive sizes
  />
  

  {/* Badges flotantes */}
  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
    {producto.isOfferOfTheDay && (
      <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
        <Star className="w-4 h-4 fill-white" /> Oferta del día
      </span>
    )}
    {producto.discount && (
      <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
        -{producto.discount}% OFF
      </span>
    )}
    {producto.freeShipping && (
      <span className="bg-green-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
        <Truck className="w-4 h-4" /> Envío Gratis
      </span>
    )}
  </div>
</div>

          {/* Lado derecho: Contenido */}
          <div className="flex flex-col">
            <div className="mb-8">
              <span className="inline-block px-5 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
                {producto.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                {producto.title}
              </h1>

              {/* Precio principal */}
              <div className="flex items-baseline gap-4 mb-6">
                <p className="text-5xl md:text-6xl font-black text-green-600 tracking-tight">
                  ${precioFinal.toFixed(0)}
                </p>
                {producto.originalPrice && producto.originalPrice > precioFinal && (
                  <p className="text-2xl md:text-3xl text-gray-500 line-through opacity-70">
                    ${producto.originalPrice.toFixed(0)}
                  </p>
                )}
              </div>
            </div>

            {/* Información clave en tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <CreditCard className="w-8 h-8 text-indigo-600 mb-3" />
                <p className="font-semibold text-gray-800">
                  {producto.installments 
                    ? `Hasta ${producto.installments} cuotas sin interés` 
                    : 'Pago único'}
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <Truck className="w-8 h-8 text-green-600 mb-3" />
                <p className="font-semibold text-gray-800">
                  {producto.freeShipping ? 'Envío gratis' : 'Envío estándar'}
                </p>
              </div>

              {producto.isOfferOfTheDay && (
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-orange-50 to-white">
                  <Star className="w-8 h-8 text-orange-500 mb-3 fill-orange-500" />
                  <p className="font-semibold text-orange-700">
                    Oferta del día
                  </p>
                </div>
              )}
            </div>

            {/* Botones principales */}
            <button
              type="button"
              className="group relative w-full py-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="relative z-10 flex items-center gap-3">
                <ShoppingCart className="w-7 h-7" />
                Agregar al Carrito
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-400/20 group-hover:to-blue-400/20 transition-opacity" />
            </button>
            <button
              type="button"
              className="group relative mt-4 w-full py-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="relative z-10 flex items-center gap-3">
                
                Comprar Ahora
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-400/20 group-hover:to-blue-400/20 transition-opacity" />
            </button>

            {/* Texto de confianza */}
            <p className="mt-6 text-center text-gray-500 text-sm">
              Compra segura • Entrega rápida • Soporte 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function generateStaticParams() {
  return db.items.map((item) => ({
    slug: generateSlug(item.title),
  }));
}

export default ProductoPage;
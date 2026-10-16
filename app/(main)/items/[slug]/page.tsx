import type { Metadata } from 'next';
import { BRAND_NAME } from '@/lib/brand';
import { formatPrice, applyDiscount } from '@/lib/money'
import { notFound } from 'next/navigation';
import { CreditCard, Star, Truck, Package, Tag } from 'lucide-react';
import { SafeImage } from '@/components/others/SafeImage';
import ItemClient from '@/components/others/ItemClient';
import { ItemUI } from '@/app/src/types/item';
import { getItemBySlug } from '../../../src/lib/items';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import FavoriteItemButton from '../../../../components/buttons/FavoriteItemButton';
import ProductReviewsSection from '@/components/others/ProductReviewsSection';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) return { title: 'Producto no encontrado' };
  const description = item.shortDescription || item.description || `${item.title} en ${BRAND_NAME}`;
  const images = item.image ? [{ url: item.image }] : undefined;
  return {
    title: item.title,
    description,
    openGraph: { title: item.title, description, type: 'website', images },
    twitter: { card: 'summary_large_image', title: item.title, description, images: item.image ? [item.image] : undefined },
  };
};

const ItemDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  const item: ItemUI | null = await getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const precioFinal = applyDiscount(item.price, item.discount);
  // Con descuento, el precio de lista tachado es item.price; sin descuento, el precio original (si existe)
  const precioAnterior = item.discount ? item.price : item.originalPrice;

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Imagen: proporción fija 1:1 (igual que la card) */}
          <div className="media group aspect-square border border-line">
            <SafeImage
              src={item.image || '/placeholder-product.jpg'}
              alt={item.title}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="pointer-events-none absolute left-0 top-0 flex flex-col items-start gap-1">
              {item.isOfferOfTheDay && (
                <Badge tone="accent" className="px-3 py-2 text-sm">
                  <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                  Oferta del día
                </Badge>
              )}
            </div>
          </div>

          {/* Contenido */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Badge tone="outline" className="px-3 py-2 text-sm">
                {item.category}
              </Badge>
              <FavoriteItemButton id={item.id} title={item.title} image={item.image} slug={item.slug} />
            </div>

            <h1 className="text-5xl leading-[0.95] text-fg md:text-6xl lg:text-7xl">{item.title}</h1>

            {item.rating !== undefined && item.reviewCount !== undefined && (
              <div className="flex items-center gap-3">
                <div className="flex" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-6 w-6',
                        i < Math.floor(item.rating!) ? 'fill-accent text-accent' : 'text-line-strong'
                      )}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-fg">
                  {item.rating.toFixed(1)} <span className="font-medium text-muted">({item.reviewCount} reseñas)</span>
                </span>
              </div>
            )}

            {/* Precio */}
            <div className="border-y border-line py-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <p className="price text-6xl text-fg md:text-7xl">{formatPrice(precioFinal, item.currency)}</p>
                {item.discount && item.discount > 0 ? (
                  <Badge tone="accent" className="px-3 py-2 text-base">
                    -{item.discount}% OFF
                  </Badge>
                ) : null}
              </div>
              {precioAnterior && precioAnterior > precioFinal && (
                <p className="mt-2 text-xl text-muted line-through">{formatPrice(precioAnterior, item.currency)}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-base">
                {item.installments && item.installments > 1 && (
                  <span className="flex items-center gap-2 font-semibold text-fg-soft">
                    <CreditCard className="h-5 w-5 text-accent" aria-hidden="true" />
                    Hasta {item.installments}x sin interés
                  </span>
                )}
                {item.freeShipping && (
                  <span className="flex items-center gap-2 font-semibold text-ok">
                    <Truck className="h-5 w-5" aria-hidden="true" />
                    Envío gratis
                  </span>
                )}
                {item.stock !== undefined && (
                  <span
                    className={cn(
                      'flex items-center gap-2 font-semibold',
                      item.stock > 10 ? 'text-fg-soft' : item.stock > 0 ? 'text-warn' : 'text-danger'
                    )}
                  >
                    <Package className="h-5 w-5" aria-hidden="true" />
                    {item.stock > 0 ? `${item.stock} disponibles` : 'Agotado'}
                  </span>
                )}
              </div>
            </div>

            {item.shortDescription && <p className="text-xl leading-relaxed text-fg-soft">{item.shortDescription}</p>}

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <Badge key={index} tone="outline" className="px-3 py-2">
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <ItemClient producto={item} precioFinal={precioFinal} />
          </div>
        </div>

        {(item.description || (item.specs && Object.keys(item.specs).length > 0)) && (
          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {item.description && (
              <div className="panel">
                <h2 className="mb-5 text-3xl">Descripción detallada</h2>
                <div className="text-lg text-fg-soft">
                  {item.description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {item.specs && Object.keys(item.specs).length > 0 && (
              <div className="panel">
                <h2 className="mb-5 text-3xl">Especificaciones</h2>
                <dl className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
                  {Object.entries(item.specs).map(([key, value]) => (
                    <div key={key} className="bg-surface-2 p-4">
                      <dt className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="text-lg font-semibold text-fg">{String(value)}</dd>
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

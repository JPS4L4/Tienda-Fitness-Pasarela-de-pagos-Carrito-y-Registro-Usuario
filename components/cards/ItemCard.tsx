"use client"

import Link from "next/link"
import { Heart, ShoppingCart, Check, Plus } from "lucide-react"
import toast from "react-hot-toast"
import { formatPrice, getPriceDisplay, PRICE_UNAVAILABLE } from "@/lib/money"
import { SafeImage } from "../others/SafeImage"
import { Badge } from "@/components/ui/Badge"
import { useCart } from "@/context/CartContext"
import { useFavoritesStore } from "@/lib/stores/favoritesStore"
import { ItemUI } from "@/app/src/types/item"
import { cn } from "@/lib/utils"

const ItemCard = ({
  id,
  title,
  price,
  category,
  originalPrice,
  discount,
  installments,
  image,
  isOfferOfTheDay,
  slug,
  currency = "COP",
  stock,
}: ItemUI) => {
  const { cart, addToCart, removeFromCart } = useCart()
  const isInCart = cart.some((item) => item.id === id)
  // price es el precio de lista: el cobro aplica el descuento (mismo cálculo que el servidor)
  const { valid: hasValidPrice, final: finalPrice, previous: previousPrice, badge } = getPriceDisplay({
    price,
    discount,
    originalPrice,
  })
  const isOutOfStock = (stock ?? 0) <= 0
  const isUnavailable = isOutOfStock || !hasValidPrice

  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore()
  const isFav = isFavorite(id, "item")

  const handleToggleCart = () => {
    if (isUnavailable) return
    if (isInCart) {
      removeFromCart(id)
      toast.success("Eliminado del carrito", { duration: 3000 })
    } else {
      addToCart({ id, title, price, category, originalPrice, discount, installments, image, isOfferOfTheDay, slug, currency })
      toast.success("Agregado al carrito", { duration: 3000 })
    }
  }

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(id, "item")
      toast.success("Eliminado de favoritos", { duration: 3000 })
    } else {
      addFavorite({ id, type: "item", title, image, slug })
      toast.success("Agregado a favoritos", { duration: 4000 })
    }
  }

  return (
    <article
      className={cn(
        "group relative flex h-full w-full flex-col border border-line bg-surface",
        "transition-colors duration-150 hover:border-accent"
      )}
    >
      {/* Imagen: proporción fija 1:1, object-cover */}
      <div className="media aspect-square">
        <Link href={`/items/${slug}`} aria-label={`Ver ${title}`} className="absolute inset-0 block">
          <SafeImage
            src={image || "/placeholder-product.svg"}
            alt={title}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
          />
        </Link>

        <div className="pointer-events-none absolute left-0 top-0 flex flex-col items-start gap-1">
          {isOfferOfTheDay && <Badge tone="accent">Oferta del día</Badge>}
          {isOutOfStock && <Badge className="bg-bg text-fg">Agotado</Badge>}
        </div>

        <button
          type="button"
          onClick={handleToggleFavorite}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center bg-bg/85 text-fg transition-colors hover:bg-accent hover:text-on-accent"
          aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
          aria-pressed={isFav}
        >
          <Heart className={cn("h-5 w-5", isFav && "fill-current animate-heartbeat")} />
        </button>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">{category}</p>
        <h3 className="line-clamp-2 min-h-[2.6em] font-sans text-base font-bold normal-case leading-snug tracking-normal text-fg">
          <Link href={`/items/${slug}`} className="transition-colors group-hover:text-accent">
            {title}
          </Link>
        </h3>

        <div className="mt-auto pt-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            {hasValidPrice ? (
              <span className="price text-3xl text-fg">{formatPrice(finalPrice, currency)}</span>
            ) : (
              <span className="text-base font-bold text-muted">{PRICE_UNAVAILABLE}</span>
            )}
            {badge ? <Badge tone="accent">-{badge}%</Badge> : null}
          </div>
          <div className="mt-1 min-h-5 text-sm text-muted">
            {previousPrice ? (
              <span className="mr-2 line-through">{formatPrice(previousPrice, currency)}</span>
            ) : null}
            {installments && installments > 1 ? (
              <span>
                o <b className="font-bold text-fg-soft">{installments}x</b> sin interés
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleToggleCart}
          disabled={isUnavailable}
          className={cn("btn btn-block", isInCart ? "btn-ghost" : "btn-primary")}
        >
          {isOutOfStock ? (
            "Agotado"
          ) : !hasValidPrice ? (
            "No disponible"
          ) : isInCart ? (
            <>
              <Check className="h-5 w-5" aria-hidden="true" />
              En carrito
            </>
          ) : (
            <>
              <span>Agregar</span>
              <span className="inline-flex items-center" aria-hidden="true">
                <ShoppingCart className="h-5 w-5" />
                <Plus className="-ml-0.5 h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="sr-only">al carrito</span>
            </>
          )}
        </button>
      </div>
    </article>
  )
}

export default ItemCard

"use client"

import { Heart, ShoppingCart, Check } from "lucide-react"
import { SafeImage } from "../others/SafeImage"
import { useCart } from "@/context/CartContext"
import { useFavoritesStore } from "@/lib/stores/favoritesStore"
import toast from "react-hot-toast"
import { ItemUI } from "@/app/src/types/item"
import { cn } from "@/lib/utils" // si tienes una función cn de clsx/tailwind-merge

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
  currency = "COP", // por defecto COP, pero ya viene de DB
  stock
}: ItemUI) => {
  const { cart, addToCart, removeFromCart } = useCart()
  const isInCart = cart.some((item: any) => item.id === id)
  const isOutOfStock = (stock ?? 0) <= 0

  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore()
  const isFav = isFavorite(id, "product")

  const handleToggleCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOutOfStock) return
    if (isInCart) {
      removeFromCart(id)
      toast.success("Eliminado del carrito 🛒", { duration: 3000 })
    } else {
      addToCart({ id, title, price, category, originalPrice, discount, installments, image, isOfferOfTheDay, slug, currency })
      toast.success("Agregado al carrito 🛒", { duration: 3000 })
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFav) {
      removeFavorite(id, "product")
      toast.success("Eliminado de favoritos ❤️", { duration: 3000 })
    } else {
      addFavorite({ id, type: "product", title, image, slug })
      toast.success("Agregado a favoritos ❤️", {
        duration: 4000,
      })
    }
  }

  const handleMoreDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `/items/${slug}`
  }

  return (
    <div 
      className={cn(
        "group relative flex flex-col bg-white rounded-2xl border border-gray-200",
        "overflow-hidden hover:shadow-2xl hover:border-gray-300",
        "transition-all duration-300 cursor-pointer h-full max-w-87.5"
      )}
    >
      {/* Contenedor de imagen */}
      <div 
        className="relative aspect-square overflow-hidden bg-gray-50"
        onClick={handleMoreDetails}
      >
        {/* Corazón favorito */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 left-3 z-30 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md hover:bg-white hover:shadow-lg transition-all duration-300"
          aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Heart
            className={cn(
              "w-6 h-6 transition-all duration-300",
              isFav
                ? "fill-red-500 text-red-500 scale-110 animate-heartbeat"
                : "text-red-500 hover:text-red-600 hover:scale-110"
            )}
          />
        </button>

        {/* Badge oferta */}
        {isOfferOfTheDay && (
          <span className="absolute top-3 right-3 z-20 bg-linear-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            Oferta del día
          </span>
        )}

        {/* Badge agotado */}
        {isOutOfStock && (
          <span className="absolute bottom-3 left-3 z-20 bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            Agotado
          </span>
        )}

        {/* Imagen */}
        <SafeImage 
          src={image || "/placeholder-product.jpg"} 
          alt={title} 
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          containerClassName="w-full h-full"
        />
      </div>

      {/* Contenido inferior */}
      <div className="p-5 flex flex-col flex-1 space-y-3" onClick={handleMoreDetails}>
        {/* Precio principal */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            {currency} {price.toLocaleString()}
          </span>
          {discount && discount >  0 ? (
            <span className="text-emerald-600 text-sm font-semibold">
              {discount}% OFF
            </span>
          ) : null}
        </div>

        {/* Precio original y cuotas */}
        {originalPrice && originalPrice > price && (
          <span className="text-sm text-gray-400 line-through">
            {currency} {originalPrice.toLocaleString()}
          </span>
        )}

        {installments && installments > 1 && (
          <p className="text-sm text-slate-600">
            en <span className="font-medium text-emerald-600">{installments}x</span> sin interés
          </p>
        )}

        {/* Título */}
        <h3 className="text-lg font-semibold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>

        {/* Categoría */}
        <p className="text-sm text-slate-500 capitalize">{category}</p>
      </div>

      {/* Botón de carrito */}
      <button
        onClick={handleToggleCart}
        disabled={isOutOfStock}
        className={cn(
          "mt-auto py-4 px-6 font-medium text-white transition-all duration-300 flex items-center justify-center gap-2",
          isOutOfStock
            ? "bg-gray-400 cursor-not-allowed"
            : isInCart
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-indigo-600 hover:bg-indigo-700"
        )}
      >
        {isOutOfStock ? (
          <>Agotado</>
        ) : isInCart ? (
          <>
            <Check className="w-5 h-5" />
            En carrito
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Añadir al carrito
          </>
        )}
      </button>
    </div>
  )
}

export default ItemCard
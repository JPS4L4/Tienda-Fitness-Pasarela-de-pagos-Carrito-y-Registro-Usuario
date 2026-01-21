"use client"

import { ItemProps } from "@/app/data/data";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { SafeImage } from "../SafeImage";
import { useCart } from "@/context/CartContext";

const ItemCard = ({
  id,
  title,
  price,
  category,
  originalPrice,
  discount,
  installments,
  image,
  isOfferOfTheDay
}: ItemProps) => {
  const { cart, addToCart, openCart, removeFromCart } = useCart();

  // Verificamos si ya está en el carrito
  const isInCart = cart.some((item:any) => item.id === id);

  const handleToggleCart = (e: React.MouseEvent) => {
  e.stopPropagation();
  if (isInCart) {
    removeFromCart(id );
  } else {
    addToCart({ id, title, price, category, originalPrice, discount, installments, image, isOfferOfTheDay });
  }
};

  const handleMoreDetails = () => {
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    window.location.href = `/products/${slug}`;
  };

  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-200 hover:shadow-2xl hover:border-gray-300 transition-all duration-300 cursor-pointer w-full max-w-[350px] overflow-hidden group relative">
      
      {/* Contenedor de imagen */}
      <div className="relative aspect-square overflow-hidden bg-gray-50" onClick={handleMoreDetails}>
        {/* Ícono de corazón (arriba izquierda) */}
        <button
          className="absolute top-3 left-3 z-30 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 group-hover:opacity-100 opacity-90"
          aria-label="Añadir a favoritos"
        >
          <Heart className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors" />
        </button>

        {/* Ícono de carrito / check (abajo derecha) */}
        <button
          onClick={handleToggleCart}
          className={`absolute bottom-3 right-3 z-30 p-2.5 rounded-full transition-all duration-300 shadow-md group-hover:opacity-100 opacity-90 ${
            isInCart
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-white/80 backdrop-blur-sm hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700"
          }`}
          aria-label={isInCart ? "Ya en carrito" : "Añadir al carrito"}
        >
          {isInCart ? (
            <Check className="w-6 h-6" />
          ) : (
            <ShoppingCart className="w-6 h-6" />
          )}
        </button>

        {/* Badge oferta */}
        {isOfferOfTheDay && (
          <span className="absolute top-3 right-3 z-20 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
            Oferta del día
          </span>
        )}

        <SafeImage 
          src={image} 
          alt={title} 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          containerClassName="w-full h-full"
        />
      </div>

      {/* Contenido inferior */}
      <div className="p-4 flex flex-col gap-2 flex-1" onClick={handleMoreDetails}>
        {/* Precios */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">
            ${price.toLocaleString()}
          </span>
          {discount && (
            <span className="text-emerald-600 text-sm font-medium">
              {discount}% OFF
            </span>
          )}
        </div>

        {originalPrice && originalPrice > price && (
          <span className="text-sm text-gray-400 line-through">
            ${originalPrice.toLocaleString()}
          </span>
        )}

        {/* Cuotas */}
        {installments && (
          <p className="text-sm text-slate-600">
            en <span className="text-emerald-600 font-medium">{installments}x</span> sin interés
          </p>
        )}

        {/* Título */}
        <h3 className="text-base font-medium text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors mt-1">
          {title}
        </h3>

        {/* Categoría */}
        <p className="text-sm text-slate-500">
          {category}
        </p>
      </div>
    </div>
  );
};

export default ItemCard;


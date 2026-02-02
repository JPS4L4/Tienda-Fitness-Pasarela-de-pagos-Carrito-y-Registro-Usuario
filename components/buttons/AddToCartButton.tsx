"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ItemUI } from "@/app/src/types/item";

interface AddToCartButtonProps {
  product: ItemUI;
  quantity: number;
  onQuantityChange: (value: number) => void;
}

export default function AddToCartButton({ product, quantity, onQuantityChange }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const isOutOfStock = (product.stock ?? 0) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsAdded(true);

    // Resetear el estado después de 2 segundos
    setTimeout(() => {
      setIsAdded(false);
      onQuantityChange(1);
    }, 2000);
  };

  return (
    <div className="space-y-4 text-black">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-2 w-fit">
        <button
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={isOutOfStock}
          className={`px-3 py-2 rounded transition-colors font-semibold text-lg ${
            isOutOfStock ? "cursor-not-allowed text-gray-400" : "hover:bg-gray-200"
          }`}
        >
          −
        </button>
        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
        <button
          onClick={() => onQuantityChange(quantity + 1)}
          disabled={isOutOfStock}
          className={`px-3 py-2 rounded transition-colors font-semibold text-lg ${
            isOutOfStock ? "cursor-not-allowed text-gray-400" : "hover:bg-gray-200"
          }`}
        >
          +
        </button>
      </div>

      {/* Botón Agregar al Carrito */}
      <button
        onClick={handleAddToCart}
        type="button"
        disabled={isOutOfStock}
        className={`group relative w-full py-6 text-white font-bold text-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${
          isOutOfStock
            ? "bg-gray-400 cursor-not-allowed"
            : isAdded
              ? "bg-linear-to-r from-green-600 to-emerald-600"
              : "bg-linear-to-r from-indigo-600 to-blue-600"
        }`}
      >
        <span className="relative z-10 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7" />
          {isOutOfStock ? "Agotado" : isAdded ? "¡Agregado!" : "Agregar al Carrito"}
        </span>
        <div className="absolute inset-0 bg-linear-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-400/20 group-hover:to-blue-400/20 transition-opacity" />
      </button>
    </div>
  );
}

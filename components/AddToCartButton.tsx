"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { ItemProps } from "@/app/data/data";
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  product: ItemProps;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);

    // Resetear el estado después de 2 segundos
    setTimeout(() => {
      setIsAdded(false);
      setQuantity(1);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-2 w-fit">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-2 hover:bg-gray-200 rounded transition-colors font-semibold text-lg"
        >
          −
        </button>
        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="px-3 py-2 hover:bg-gray-200 rounded transition-colors font-semibold text-lg"
        >
          +
        </button>
      </div>

      {/* Botón Agregar al Carrito */}
      <button
        onClick={handleAddToCart}
        type="button"
        className={`group relative w-full py-6 text-white font-bold text-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${
          isAdded
            ? "bg-linear-to-r from-green-600 to-emerald-600"
            : "bg-linear-to-r from-indigo-600 to-blue-600"
        }`}
      >
        <span className="relative z-10 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7" />
          {isAdded ? "¡Agregado!" : "Agregar al Carrito"}
        </span>
        <div className="absolute inset-0 bg-linear-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-400/20 group-hover:to-blue-400/20 transition-opacity" />
      </button>
    </div>
  );
}

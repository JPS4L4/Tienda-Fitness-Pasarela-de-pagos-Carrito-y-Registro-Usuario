"use client";

import { useRouter } from "next/navigation";
import { ItemUI } from "@/app/src/types/item";
import AddToCartButton from "@/components/buttons/AddToCartButton";
import { useState } from "react";

interface ItemClientProps {
  producto: ItemUI;
  precioFinal: number;
}

export default function ItemClient({ producto }: ItemClientProps) {
  const isOutOfStock = (producto.stock ?? 0) <= 0;
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const safeQuantity = Math.max(1, quantity);
    router.push(`/checkout?type=cart&buyNowId=${producto.id}&qty=${safeQuantity}`);
  };
  return (
    <div className="w-full space-y-4">
      {/* Botones principales */}
      <AddToCartButton
        product={producto}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />

      <button
        type="button"
        disabled={isOutOfStock}
        onClick={handleBuyNow}
        className={`group relative w-full py-6 text-white font-bold text-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${
          isOutOfStock
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-linear-to-r from-emerald-600 to-green-600"
        }`}
      >
        <span className="relative z-10 flex items-center gap-3">
          {isOutOfStock ? "Agotado" : "Comprar Ahora"}
        </span>
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/0 to-green-500/0 group-hover:from-emerald-400/20 group-hover:to-green-400/20 transition-opacity" />
      </button>

      {/* Texto de confianza */}
      <p className="pt-2 text-center text-gray-500 text-sm">
        Compra segura • Entrega rápida • Soporte 24/7
      </p>
    </div>
  );
}

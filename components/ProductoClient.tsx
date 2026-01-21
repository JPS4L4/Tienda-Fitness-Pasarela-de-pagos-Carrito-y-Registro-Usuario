"use client";

import { ItemProps } from "@/app/data/data";
import AddToCartButton from "@/components/AddToCartButton";

interface ProductoClientProps {
  producto: ItemProps;
  precioFinal: number;
}

export default function ProductoClient({ producto }: ProductoClientProps) {
  return (
    <>
      {/* Botones principales */}
      <AddToCartButton product={producto} />
      
      <button
        type="button"
        className="group relative mt-4 w-full py-6 bg-linear-to-r from-emerald-600 to-green-600 text-white font-bold text-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
      >
        <span className="relative z-10 flex items-center gap-3">
          Comprar Ahora
        </span>
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/0 to-green-500/0 group-hover:from-emerald-400/20 group-hover:to-green-400/20 transition-opacity" />
      </button>

      {/* Texto de confianza */}
      <p className="mt-6 text-center text-gray-500 text-sm">
        Compra segura • Entrega rápida • Soporte 24/7
      </p>
    </>
  );
}

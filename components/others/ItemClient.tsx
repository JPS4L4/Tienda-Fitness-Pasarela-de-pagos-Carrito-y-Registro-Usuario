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
      <AddToCartButton product={producto} quantity={quantity} onQuantityChange={setQuantity} />

      <button
        type="button"
        disabled={isOutOfStock}
        onClick={handleBuyNow}
        className="btn btn-secondary btn-lg btn-block"
      >
        {isOutOfStock ? "Agotado" : "Comprar ahora"}
      </button>

      <p className="pt-2 text-center text-sm text-muted">Compra segura. Entrega rápida. Soporte 24/7.</p>
    </div>
  );
}

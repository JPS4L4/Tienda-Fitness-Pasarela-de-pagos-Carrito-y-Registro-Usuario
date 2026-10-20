"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ItemUI } from "@/app/src/types/item";
import { isValidPrice } from "@/lib/money";

interface AddToCartButtonProps {
  product: ItemUI;
  quantity: number;
  onQuantityChange: (value: number) => void;
}

export default function AddToCartButton({ product, quantity, onQuantityChange }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const isOutOfStock = (product.stock ?? 0) <= 0;
  const isUnavailable = isOutOfStock || !isValidPrice(product.price);

  const handleAddToCart = () => {
    if (isUnavailable) return;
    addToCart(product, quantity);
    setIsAdded(true);

    // Resetear el estado después de 2 segundos
    setTimeout(() => {
      setIsAdded(false);
      onQuantityChange(1);
    }, 2000);
  };

  const stepper =
    "flex h-12 w-12 items-center justify-center text-xl font-bold transition-colors hover:bg-accent hover:text-on-accent disabled:cursor-not-allowed disabled:text-subtle disabled:hover:bg-transparent";

  return (
    <div className="space-y-4 text-fg">
      {/* Selector de cantidad */}
      <div className="flex w-fit items-stretch border-2 border-line-strong" role="group" aria-label="Cantidad">
        <button
          type="button"
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={isOutOfStock}
          aria-label="Disminuir cantidad"
          className={stepper}
        >
          -
        </button>
        <span className="flex w-14 items-center justify-center border-x-2 border-line-strong text-lg font-bold" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onQuantityChange(quantity + 1)}
          disabled={isOutOfStock}
          aria-label="Aumentar cantidad"
          className={stepper}
        >
          +
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        type="button"
        disabled={isUnavailable}
        className={isAdded ? "btn btn-ok btn-lg btn-block" : "btn btn-primary btn-lg btn-block"}
      >
        <ShoppingCart className="h-6 w-6" aria-hidden="true" />
        {isOutOfStock ? "Agotado" : isUnavailable ? "No disponible" : isAdded ? "Agregado" : "Agregar al carrito"}
      </button>
    </div>
  );
}

"use client";

import { formatPrice, applyDiscount } from '@/lib/money'

import { useCart } from "@/context/CartContext";
import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { SafeImage } from "../others/SafeImage";
import Link from "next/link";

export default function CartSidebar() {
  const { cart, isOpen, closeCart, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  if (!isOpen) return null;

  const totalPrice = getTotalPrice();
  const stepper = "flex h-9 w-9 items-center justify-center text-fg transition-colors hover:bg-accent hover:text-on-accent";

  return (
    <>
      {/* Overlay oscuro */}
      <div className="fixed inset-0 z-40 bg-black/70" onClick={closeCart} aria-hidden="true" />

      {/* Sidebar del carrito */}
      <aside
        className="fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col overflow-hidden border-l-2 border-accent bg-surface sm:w-[26rem]"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="flex items-center gap-3 text-3xl text-fg">
            <ShoppingCart className="h-7 w-7 text-accent" aria-hidden="true" />
            Carrito
          </h2>
          <button
            onClick={closeCart}
            className="flex h-11 w-11 items-center justify-center text-fg transition-colors hover:bg-surface-3 hover:text-accent"
            aria-label="Cerrar carrito"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted">
              <ShoppingCart className="mb-4 h-14 w-14 text-subtle" aria-hidden="true" />
              <p className="text-lg font-bold text-fg-soft">Tu carrito está vacío</p>
              <p className="text-sm">Agrega productos para empezar</p>
            </div>
          ) : (
            cart.map((item) => {
              const itemPrice = applyDiscount(item.price, item.discount);
              const subtotal = itemPrice * item.quantity;

              return (
                <div key={item.id} className="border border-line bg-surface-2 p-3">
                  <div className="mb-3 flex gap-3">
                    {item.image && (
                      <div className="media aspect-square w-20 shrink-0">
                        <SafeImage src={item.image} alt={item.title} sizes="80px" className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-sans text-base font-bold normal-case tracking-normal text-fg">{item.title}</h3>
                      <p className="text-sm text-muted">{item.category}</p>
                      <p className="price mt-1 text-2xl text-fg">{formatPrice(itemPrice)}</p>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-stretch border-2 border-line-strong">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={stepper}
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="flex w-10 items-center justify-center border-x-2 border-line-strong font-bold text-fg">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={stepper}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-fg-soft">Subtotal: {formatPrice(subtotal)}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex w-full items-center justify-center gap-2 py-2 text-sm font-bold uppercase tracking-[0.1em] text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Eliminar
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="space-y-4 border-t border-line bg-surface-2 p-5">
            <div className="flex items-end justify-between">
              <span className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted">Total</span>
              <span className="price text-4xl text-fg">{formatPrice(totalPrice)}</span>
            </div>
            <Link href="/checkout?type=cart" onClick={closeCart} className="btn btn-primary btn-lg btn-block">
              Proceder al pago
            </Link>
            <button onClick={closeCart} className="btn btn-secondary btn-block">
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

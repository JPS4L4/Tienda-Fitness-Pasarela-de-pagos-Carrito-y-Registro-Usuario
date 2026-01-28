"use client";

import { useCart } from "@/context/CartContext";
import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { SafeImage } from "../others/SafeImage";
import Link from "next/link";

export default function CartSidebar() {
  const { cart, isOpen, closeCart, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  if (!isOpen) return null;

  const totalPrice = getTotalPrice();

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Sidebar del carrito */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col overflow-hidden transition-transform duration-300">
        
        {/* Header */}
        <div className="bg-linear-to-r from-gray-900 to-gray-600 text-white p-6 flex items-center justify-between">
          <ShoppingCart className="w-10 h-10 mx-auto" />
          <h2 className="text-2xl font-bold mx-auto">Carrito</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-lg font-semibold">Tu carrito está vacío</p>
              <p className="text-sm">Agrega productos para empezar</p>
            </div>
          ) : (
            cart.map((item) => {
              const itemPrice = item.discount
                ? Math.round(item.price * (1 - item.discount / 100))
                : item.price;
              const subtotal = itemPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {/* Imagen y título */}
                  <div className="flex gap-4 mb-4">
                    {item.image && (
                      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <SafeImage
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ${itemPrice}
                      </p>
                    </div>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Subtotal: ${subtotal}
                    </p>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-2xl text-green-600">${totalPrice}</span>
            </div>
            <Link
              href="/checkout?type=cart"
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-center block"
            >
              Proceder al Pago
            </Link>
            <button
              onClick={closeCart}
              className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}

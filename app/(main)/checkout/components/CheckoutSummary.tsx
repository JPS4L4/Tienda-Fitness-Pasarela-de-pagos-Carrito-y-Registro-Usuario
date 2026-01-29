'use client';

import { Check, Trash2 } from 'lucide-react';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  discount?: number;
}

interface Plan {
  id: number;
  title: string;
  price: number;
  description?: string;
  coverage: string[];
}

interface CheckoutSummaryProps {
  type: 'cart' | 'plan';
  cartItems: CartItem[];
  plan: Plan | null;
  onRemoveItem: (itemId: number) => void;
  calculateTotal: () => number;
}

export default function CheckoutSummary({
  type,
  cartItems,
  plan,
  onRemoveItem,
  calculateTotal,
}: CheckoutSummaryProps) {
  return (
    <div className="order-2 lg:order-1">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden sticky top-8">
        <div className="bg-linear-to-r from-indigo-600 to-blue-600 p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Resumen de tu pedido
          </h2>
        </div>
        
        <div className="p-6 lg:p-8">
          {type === 'cart' ? (
            <div className="space-y-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-slate-500 font-medium">Tu carrito está vacío</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const itemPrice = item.discount
                        ? Math.round(item.price * (1 - item.discount / 100))
                        : item.price;
                      const subtotal = itemPrice * item.quantity;

                      return (
                        <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200 group relative">
                          {item.image && (
                            <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-md">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{item.title}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                                Cantidad: {item.quantity}
                              </span>
                              {item.discount && (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                  -{item.discount}% OFF
                                </span>
                              )}
                            </div>
                            <p className="text-xl font-bold text-indigo-600">
                              ${subtotal.toLocaleString()}
                            </p>
                          </div>
                          {/* Botón eliminar */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="shrink-0 self-start p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Eliminar del carrito"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 mt-6 border-t-2 border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600 font-medium">Subtotal</span>
                      <span className="text-slate-900 font-semibold">${calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                      <span className="text-slate-600 font-medium">Envío</span>
                      <span className="text-green-600 font-semibold">Gratis</span>
                    </div>
                    <div className="flex justify-between items-center bg-linear-to-r from-indigo-600 to-blue-600 p-4 rounded-2xl">
                      <span className="text-white text-xl font-bold">Total</span>
                      <span className="text-white text-3xl font-black">${calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : plan ? (
            <div className="space-y-6">
              <div className="bg-linear-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border-2 border-indigo-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-black text-slate-900">{plan.title}</h3>
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    PLAN
                  </span>
                </div>
                {plan.description && (
                  <p className="text-slate-700 mb-6 leading-relaxed">{plan.description}</p>
                )}
                <ul className="space-y-3">
                  {plan.coverage.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <Check className="w-5 h-5 text-green-600 bg-green-100 rounded-full p-0.5" />
                      </div>
                      <span className="text-slate-800 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-linear-to-r from-indigo-600 to-blue-600 p-6 rounded-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium mb-1">Total a pagar</p>
                    <span className="text-white text-4xl font-black">
                      ${plan.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-white/80">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Cargando resumen...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

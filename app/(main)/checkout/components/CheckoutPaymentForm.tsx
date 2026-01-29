'use client';

import { CardElement } from '@stripe/react-stripe-js';
import { cn } from '@/lib/utils';

interface ShippingInfo {
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  state: string;
}

interface CheckoutPaymentFormProps {
  type: 'cart' | 'plan';
  shippingInfo: ShippingInfo;
  paymentMethod: 'stripe' | 'mercadopago';
  loading: boolean;
  cartItemsCount: number;
  hasPlan: boolean;
  totalAmount: number;
  currency: string;
  hasStripeElements: boolean;
  onShippingChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaymentMethodChange: (method: 'stripe' | 'mercadopago') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CheckoutPaymentForm({
  type,
  shippingInfo,
  paymentMethod,
  loading,
  cartItemsCount,
  hasPlan,
  totalAmount,
  currency,
  hasStripeElements,
  onShippingChange,
  onPaymentMethodChange,
  onSubmit,
}: CheckoutPaymentFormProps) {
  return (
    <div className="order-1 lg:order-2">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-linear-to-r from-slate-800 to-slate-900 p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {type === 'cart' ? 'Información de envío' : 'Método de pago'}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="p-6 lg:p-8 space-y-8">
          {/* Formulario de envío solo para carrito */}
          {type === 'cart' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={onShippingChange}
                      className="block w-full rounded-xl border-2 border-slate-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all py-3 px-4 text-slate-900 font-medium placeholder:text-slate-400"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={onShippingChange}
                    className="block w-full rounded-xl border-2 border-slate-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all py-3 px-4 text-slate-900 font-medium placeholder:text-slate-400"
                    placeholder="+57 300 123 4567"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="address" className="block text-sm font-bold text-slate-700 mb-2">
                  Dirección completa <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={shippingInfo.address}
                  onChange={onShippingChange}
                  className="block w-full rounded-xl border-2 border-slate-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all py-3 px-4 text-slate-900 font-medium placeholder:text-slate-400"
                  placeholder="Calle 123 #45-67, Apto 501"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="group">
                  <label htmlFor="postalCode" className="block text-sm font-bold text-slate-700 mb-2">
                    Código postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={shippingInfo.postalCode}
                    onChange={onShippingChange}
                    className="block w-full rounded-xl border-2 border-slate-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all py-3 px-4 text-slate-900 font-medium placeholder:text-slate-400"
                    placeholder="110111"
                    required
                  />
                </div>

                <div className="group">
                  <label htmlFor="city" className="block text-sm font-bold text-slate-700 mb-2">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={shippingInfo.city}
                    onChange={onShippingChange}
                    className="block w-full rounded-xl border-2 border-slate-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all py-3 px-4 text-slate-900 font-medium placeholder:text-slate-400"
                    placeholder="Bogotá"
                    required
                  />
                </div>

                <div className="group">
                  <label htmlFor="state" className="block text-sm font-bold text-slate-700 mb-2">
                    Departamento <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={shippingInfo.state}
                    onChange={onShippingChange}
                    className="block w-full rounded-xl border-2 border-slate-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all py-3 px-4 text-slate-900 font-medium placeholder:text-slate-400"
                    placeholder="Cundinamarca"
                    required
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm font-bold text-slate-500 uppercase tracking-wide">
                    Continuar con el pago
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div>
            <label className="flex items-center gap-2 text-lg font-black text-slate-900 mb-5">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Método de pago
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onPaymentMethodChange('stripe')}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-3 py-6 px-6 rounded-2xl border-3 font-bold transition-all duration-300 group",
                  paymentMethod === 'stripe'
                    ? "border-indigo-600 bg-linear-to-br from-indigo-50 to-blue-50 text-indigo-700 shadow-xl scale-105"
                    : "border-slate-300 hover:border-indigo-400 text-slate-700 hover:shadow-lg"
                )}
              >
                {paymentMethod === 'stripe' && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
                <svg className={cn("w-12 h-12 transition-colors", paymentMethod === 'stripe' ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500")} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 13H5V7h14v10z" />
                  <circle cx="8" cy="13" r="1" />
                  <circle cx="12" cy="13" r="1" />
                  <circle cx="16" cy="13" r="1" />
                </svg>
                <span className="text-base">Tarjeta (Stripe)</span>
              </button>

              <button
                type="button"
                onClick={() => onPaymentMethodChange('mercadopago')}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-3 py-6 px-6 rounded-2xl border-3 font-bold transition-all duration-300 group",
                  paymentMethod === 'mercadopago'
                    ? "border-blue-600 bg-linear-to-br from-blue-50 to-cyan-50 text-blue-700 shadow-xl scale-105"
                    : "border-slate-300 hover:border-blue-400 text-slate-700 hover:shadow-lg"
                )}
              >
                {paymentMethod === 'mercadopago' && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black transition-colors", paymentMethod === 'mercadopago' ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600")}>
                  MP
                </div>
                <span className="text-base">Mercado Pago</span>
              </button>
            </div>
          </div>

          {/* Elemento de tarjeta Stripe */}
          {paymentMethod === 'stripe' && (
            <div className="p-6 border-2 border-indigo-200 rounded-2xl bg-linear-to-br from-indigo-50/50 to-blue-50/50 shadow-inner">
              <div className="mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-sm font-bold text-slate-700">Información de la tarjeta</span>
              </div>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1e293b',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      '::placeholder': { color: '#94a3b8' },
                    },
                    invalid: { color: '#ef4444' },
                  },
                }}
              />
            </div>
          )}

          {/* Botón pagar */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={
                loading ||
                (paymentMethod === 'stripe' && !hasStripeElements) ||
                (type === 'cart' && cartItemsCount === 0) ||
                (type === 'plan' && !hasPlan)
              }
              className={cn(
                "w-full py-6 px-8 rounded-2xl font-black text-xl text-white transition-all duration-300 shadow-2xl relative overflow-hidden group",
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-linear-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-700 hover:via-blue-700 hover:to-indigo-700 active:scale-95 bg-size-200 bg-pos-0 hover:bg-pos-100"
              )}
            >
              {!loading && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                  </svg>
                  Procesando pago...
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pagar {currency}{totalAmount.toLocaleString()}
                </span>
              )}
            </button>

            {/* Indicador de seguridad */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-semibold">
                Pago 100% seguro y encriptado
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

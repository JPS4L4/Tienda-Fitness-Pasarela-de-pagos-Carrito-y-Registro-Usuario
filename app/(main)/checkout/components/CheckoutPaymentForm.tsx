'use client';

import { formatPrice } from '@/lib/money'

import { PaymentElement } from '@stripe/react-stripe-js';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import DemoCardForm from './DemoCardForm';
import type { CardInput } from '@/lib/payments/card';
import stripeLogo from '@/images/Logos/stripe-logo-black-transparent.png';
import mercadopagoLogo from '@/images/Logos/mercadopago_sin_letras.png';

interface ShippingInfo {
  firstName: string;
  lastName: string;
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
  /** Modo demo: tarjeta simulada en lugar de Stripe / Mercado Pago */
  demo: boolean;
  card: CardInput;
  onCardChange: (card: CardInput) => void;
  invalidCardField: keyof CardInput | null;
  loading: boolean;
  cartItemsCount: number;
  hasPlan: boolean;
  totalAmount: number;
  /** false mientras el servidor calcula el total: no se puede pagar */
  totalReady: boolean;
  currency: string;
  hasStripeElements: boolean;
  stripeAvailable: boolean;
  stripeClientSecret: string | null;
  stripeIntentLoading: boolean;
  onShippingChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaymentMethodChange: (method: 'stripe' | 'mercadopago') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CheckoutPaymentForm({
  type,
  shippingInfo,
  paymentMethod,
  demo,
  card,
  onCardChange,
  invalidCardField,
  loading,
  cartItemsCount,
  hasPlan,
  totalAmount,
  totalReady,
  currency,
  hasStripeElements,
  stripeAvailable,
  stripeClientSecret,
  stripeIntentLoading,
  onShippingChange,
  onPaymentMethodChange,
  onSubmit,
}: CheckoutPaymentFormProps) {
  return (
    <div className="order-1 lg:order-2">
      <div className="card overflow-hidden">
        <div className="border-b border-line bg-surface-2 p-5 lg:p-6">
          <h2 className="flex items-center gap-3 text-3xl text-fg">
            <svg className="h-7 w-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {type === 'cart' ? 'Información de envío' : 'Tu pago'}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-8 p-5 lg:p-6">
          {/* Formulario de envío solo para carrito */}
          {type === 'cart' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="group">
                  <label htmlFor="firstName" className="label">
                    Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={onShippingChange}
                    className="input"
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                <div className="group">
                  <label htmlFor="lastName" className="label">
                    Apellidos <span className="text-danger">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={onShippingChange}
                    className="input"
                    placeholder="Tus apellidos"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="group">
                  <label htmlFor="email" className="label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={onShippingChange}
                      className="input"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="phone" className="label">
                    Teléfono <span className="text-danger">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={onShippingChange}
                    className="input"
                    placeholder="+57 300 123 4567"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="address" className="label">
                  Dirección completa <span className="text-danger">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={shippingInfo.address}
                  onChange={onShippingChange}
                  className="input"
                  placeholder="Calle 123 #45-67, Apto 501"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="group">
                  <label htmlFor="postalCode" className="label">
                    Código postal <span className="text-danger">*</span>
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={shippingInfo.postalCode}
                    onChange={onShippingChange}
                    className="input"
                    placeholder="110111"
                    required
                  />
                </div>

                <div className="group">
                  <label htmlFor="city" className="label">
                    Ciudad <span className="text-danger">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={shippingInfo.city}
                    onChange={onShippingChange}
                    className="input"
                    placeholder="Bogotá"
                    required
                  />
                </div>

                <div className="group">
                  <label htmlFor="state" className="label">
                    Departamento <span className="text-danger">*</span>
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={shippingInfo.state}
                    onChange={onShippingChange}
                    className="input"
                    placeholder="Cundinamarca"
                    required
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-line"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface px-4 text-sm font-bold text-muted uppercase tracking-wide">
                    Continuar con el pago
                  </span>
                </div>
              </div>
            </div>
          )}

          {demo && (
            <div>
              <p className="mb-5 flex items-center gap-2 text-2xl font-display uppercase text-fg">
                Pago con tarjeta
              </p>
              <DemoCardForm card={card} onChange={onCardChange} invalidField={invalidCardField} disabled={loading} />
            </div>
          )}

          {!demo && (
          <>
          {/* Método de pago */}
          <div>
            <p className="mb-5 flex items-center gap-2 text-2xl font-display uppercase text-fg">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Método de pago
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onPaymentMethodChange('stripe')}
                disabled={!stripeAvailable}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-3 border-2 px-6 py-6 font-bold transition-colors",
                  paymentMethod === 'stripe'
                    ? "border-accent bg-accent/10 text-fg"
                    : "border-line-strong text-fg-soft hover:border-accent"
                )}
              >
                {!stripeAvailable && (
                  <span className="absolute bottom-2 text-xs text-danger">No configurado</span>
                )}
                {paymentMethod === 'stripe' && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
                <span className="flex h-12 w-16 items-center justify-center bg-white p-1"><Image src={stripeLogo} alt="Stripe Logo" width={48} height={48} className="h-auto w-full object-contain" /></span>
                <span className="text-base">Tarjeta (Stripe)</span>
              </button>

              <button
                type="button"
                onClick={() => onPaymentMethodChange('mercadopago')}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-3 border-2 px-6 py-6 font-bold transition-colors",
                  paymentMethod === 'mercadopago'
                    ? "border-accent bg-accent/10 text-fg"
                    : "border-line-strong text-fg-soft hover:border-accent"
                )}
              >
                {paymentMethod === 'mercadopago' && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
                <span className="flex h-12 w-16 items-center justify-center bg-white p-1">
                  <Image src={mercadopagoLogo} alt="Mercado Pago Logo" width={48} height={48} className="h-auto w-full object-contain" />
                </span>
                <span className="text-base">Mercado Pago</span>
              </button>
            </div>
          </div>

          {/* Elemento de pago Stripe */}
          {paymentMethod === 'stripe' && (
            <div className="border-2 border-line-strong bg-surface-2 p-5">
              <div className="mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-sm font-bold text-fg-soft">Información de la tarjeta</span>
              </div>

              {!stripeAvailable && (
                <div className="text-sm text-danger bg-danger/10 border border-danger  p-3">
                  Stripe no está configurado. Agrega la clave pública y reinicia la app.
                </div>
              )}

              {stripeAvailable && stripeIntentLoading && (
                <div className="text-sm text-warn bg-warn/10 border border-warn  p-3">
                  Preparando el pago con Stripe...
                </div>
              )}

              {stripeAvailable && !stripeIntentLoading && !stripeClientSecret && (
                <div className="text-sm text-warn bg-warn/10 border border-warn  p-3">
                  Stripe no está listo todavía. Intenta de nuevo en unos segundos.
                </div>
              )}

              {stripeAvailable && !stripeIntentLoading && !hasStripeElements && (
                <div className="text-sm text-warn bg-warn/10 border border-warn  p-3">
                  Cargando Stripe... Si no aparece el campo, revisa bloqueadores o conexión.
                </div>
              )}

              {stripeAvailable && hasStripeElements && stripeClientSecret && (
                <PaymentElement
                  options={{
                    layout: {
                      type: 'tabs',
                      defaultCollapsed: false,
                    },
                  }}
                />
              )}
            </div>
          )}

          </>
          )}

          {/* Botón pagar */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={
                loading ||
                (!demo && paymentMethod === 'stripe' && (!hasStripeElements || stripeIntentLoading || !stripeClientSecret)) ||
                !totalReady ||
                (type === 'cart' && cartItemsCount === 0) ||
                (type === 'plan' && !hasPlan)
              }
              className="btn btn-primary btn-lg btn-block"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="spinner" aria-hidden="true" />
                  Procesando pago...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {totalReady ? `Pagar ${formatPrice(totalAmount, currency)}` : 'Calculando total...'}
                </span>
              )}
            </button>

            {/* Indicador de seguridad */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted bg-surface-2 p-4 border border-line">
              <svg className="w-5 h-5 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

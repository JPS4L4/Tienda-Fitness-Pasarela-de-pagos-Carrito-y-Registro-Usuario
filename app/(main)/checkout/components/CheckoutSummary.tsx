'use client';

import { formatPrice, getPriceDisplay } from '@/lib/money'

import { Check, Trash2, ShoppingBag } from 'lucide-react';
import { SafeImage } from '@/components/others/SafeImage';
import { Badge } from '@/components/ui/Badge';

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
  /** Total calculado por el servidor; null mientras se calcula */
  calculateTotal: () => number | null;
}

export default function CheckoutSummary({
  type,
  cartItems,
  plan,
  onRemoveItem,
  calculateTotal,
}: CheckoutSummaryProps) {
  const total = calculateTotal();
  const totalLabel = total === null ? 'Calculando...' : formatPrice(total);

  return (
    <div className="order-2 lg:order-1">
      <div className="card sticky top-24 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line bg-surface-2 p-5 lg:p-6">
          <ShoppingBag className="h-7 w-7 text-accent" aria-hidden="true" />
          <h2 className="text-3xl text-fg">Resumen de tu pedido</h2>
        </div>

        <div className="p-5 lg:p-6">
          {type === 'cart' ? (
            <div className="space-y-6">
              {cartItems.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-subtle" aria-hidden="true" />
                  <p className="font-medium text-muted">Tu carrito está vacío</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cartItems.map((item) => {
                      const { valid, final: itemPrice, badge } = getPriceDisplay(item);
                      const subtotal = itemPrice * item.quantity;

                      return (
                        <div key={item.id} className="relative flex gap-4 border border-line bg-surface-2 p-3">
                          {item.image && (
                            <div className="media aspect-square w-24 shrink-0">
                              <SafeImage src={item.image} alt={item.title} sizes="96px" className="object-cover" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="mb-1 truncate font-sans text-lg font-bold normal-case tracking-normal text-fg">{item.title}</h3>
                            <div className="mb-2 flex items-center gap-2">
                              <Badge tone="outline">Cant. {item.quantity}</Badge>
                              {badge ? <Badge tone="accent">-{badge}%</Badge> : null}
                            </div>
                            <p className="price text-2xl text-fg">{valid ? formatPrice(subtotal) : 'Precio no disponible'}</p>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center self-start text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
                            aria-label={`Eliminar ${item.title} del carrito`}
                            title="Eliminar del carrito"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 border-t-2 border-line pt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-muted">Subtotal</span>
                      <span className="font-semibold text-fg">{totalLabel}</span>
                    </div>
                    <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
                      <span className="font-medium text-muted">Envío</span>
                      <span className="font-semibold text-ok">Gratis</span>
                    </div>
                    <div className="flex items-center justify-between bg-accent p-4 text-on-accent">
                      <span className="text-sm font-extrabold uppercase tracking-[0.14em]">Total</span>
                      <span className="price text-4xl">{totalLabel}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : plan ? (
            <div className="space-y-6">
              <div className="border border-line bg-surface-2 p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="text-3xl leading-none text-fg">{plan.title}</h3>
                  <Badge tone="accent">Plan</Badge>
                </div>
                {plan.description && <p className="mb-5 leading-relaxed text-fg-soft">{plan.description}</p>}
                <ul className="space-y-3">
                  {plan.coverage.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={3} aria-hidden="true" />
                      <span className="font-medium text-fg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-end justify-between bg-accent p-5 text-on-accent">
                <div>
                  <p className="mb-1 text-sm font-extrabold uppercase tracking-[0.14em]">Total a pagar</p>
                  <span className="price text-5xl">{totalLabel}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="font-medium text-muted">Cargando resumen...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

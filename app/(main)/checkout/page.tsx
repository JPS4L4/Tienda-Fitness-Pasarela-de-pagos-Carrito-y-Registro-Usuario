'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';
import CheckoutSummary from './components/CheckoutSummary';
import CheckoutPaymentForm from './components/CheckoutPaymentForm';
import { ItemUI } from '@/app/src/types/item';
import FitnessProfileGate from '@/components/others/FitnessProfileGate';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

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

const CheckoutForm = ({
  type,
  planId,
  buyNowItemId,
  buyNowQuantity,
  stripeClientSecret,
  stripePaymentIntentId,
  stripeIntentAmount,
  stripeCheckoutSessionId,
  stripeIntentLoading,
  onStripeIntentChange,
  onStripeIntentLoadingChange,
}: {
  type: 'cart' | 'plan';
  planId?: string;
  buyNowItemId?: string;
  buyNowQuantity?: number;
  stripeClientSecret: string | null;
  stripePaymentIntentId: string | null;
  stripeIntentAmount: number | null;
  stripeCheckoutSessionId: string | null;
  stripeIntentLoading: boolean;
  onStripeIntentChange: (payload: {
    clientSecret: string | null;
    paymentIntentId: string | null;
    amount: number | null;
    checkoutSessionId: string | null;
  }) => void;
  onStripeIntentLoadingChange: (isLoading: boolean) => void;
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart: contextCart, clearCart, removeFromCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mercadopago'>('stripe');
  const isBuyNow = Boolean(buyNowItemId);
  const [fitnessProfileLoading, setFitnessProfileLoading] = useState(false);
  const [requiresFitnessProfile, setRequiresFitnessProfile] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
    address: '',
    postalCode: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    if (!session?.user) return;
    setShippingInfo(prev => ({
      ...prev,
      email: prev.email || session.user.email || '',
      phone: prev.phone || session.user.phone || '',
      firstName: prev.firstName || session.user.name?.split(' ')[0] || '',
      lastName: prev.lastName || session.user.name?.split(' ').slice(1).join(' ') || '',
    }));
  }, [session]);

  // Verificar autenticación solo para planes
  useEffect(() => {
    if (type === 'plan' && status === 'unauthenticated') {
      toast.error('Debes iniciar sesión para suscribirte a un plan');
      router.push(`/login?callbackUrl=/checkout?type=plan&planId=${planId}`);
    }
  }, [type, status, router, planId]);

  useEffect(() => {
    if (type !== 'plan' || status !== 'authenticated') {
      setRequiresFitnessProfile(false);
      return;
    }

    let active = true;

    const loadFitnessProfile = async () => {
      setFitnessProfileLoading(true);
      try {
        const res = await fetch('/api/profile');
        if (res.status === 401) return;
        const data = await res.json();
        if (!active) return;
        setRequiresFitnessProfile(!Boolean(data?.user?.fitnessProfileCompleted));
      } catch (error) {
        if (active) {
          setRequiresFitnessProfile(true);
        }
      } finally {
        if (active) {
          setFitnessProfileLoading(false);
        }
      }
    };

    loadFitnessProfile();

    return () => {
      active = false;
    };
  }, [type, status]);

  useEffect(() => {
    if (!stripeKey && paymentMethod === 'stripe') {
      toast.error('Stripe no está configurado. Usa MercadoPago o agrega la clave pública.');
      setPaymentMethod('mercadopago');
    }
  }, [paymentMethod]);

  // Cargar datos según tipo
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type === 'cart') {
          if (buyNowItemId) {
            const itemsResponse = await fetch('/api/items');
            if (!itemsResponse.ok) {
              throw new Error('Error al cargar productos');
            }
            const items: ItemUI[] = await itemsResponse.json();
            const selected = items.find(current => String(current.id) === String(buyNowItemId));
            if (!selected) {
              throw new Error('Producto no encontrado');
            }
            setCartItems([
              {
                id: selected.id,
                title: selected.title,
                price: selected.price,
                quantity: Math.max(1, buyNowQuantity ?? 1),
                image: selected.image,
                category: selected.category,
                discount: selected.discount,
              },
            ]);
          } else {
            setCartItems(contextCart);
          }
        } else if (type === 'plan' && planId) {
          const response = await fetch(`/api/plans/${planId}`);
          if (!response.ok) throw new Error('Plan no encontrado');
          const data = await response.json();
          setPlan(data);
        }
      } catch (error) {
        toast.error('Error al cargar los datos');
        console.error(error);
      }
    };

    fetchData();
  }, [type, planId, contextCart, buyNowItemId, buyNowQuantity]);

  // Calcular total
  const totalAmount = useMemo(() => {
    if (type === 'cart') {
      return cartItems.reduce((sum, item) => {
        const itemPrice = item.discount
          ? Math.round(item.price * (1 - item.discount / 100))
          : item.price;
        return sum + itemPrice * item.quantity;
      }, 0);
    }
    return plan?.price || 0;
  }, [type, cartItems, plan]);

  // Variable para moneda
  const currency = '$';

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentMethodChange = (method: 'stripe' | 'mercadopago') => {
    setPaymentMethod(method);
  };

  const validateShippingInfo = () => {
    const { firstName, lastName, email, phone, address, postalCode, city, state } = shippingInfo;
    if (!firstName || !lastName || !email || !phone || !address || !postalCode || !city || !state) {
      toast.error('Por favor completa todos los campos de envío');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Email inválido');
      return false;
    }
    return true;
  };

  useEffect(() => {
    const createStripeIntent = async () => {
      if (type === 'plan' && (fitnessProfileLoading || requiresFitnessProfile)) {
        return;
      }

      if (paymentMethod !== 'stripe') {
        if (stripeIntentLoading) {
          onStripeIntentLoadingChange(false);
        }
        return;
      }

      if (!stripeKey || totalAmount <= 0) {
        return;
      }

      if (stripeIntentLoading) {
        return;
      }

      if (
        stripeClientSecret &&
        stripePaymentIntentId &&
        stripeIntentAmount === totalAmount
      ) {
        return;
      }

      try {
        onStripeIntentLoadingChange(true);
        onStripeIntentChange({
          clientSecret: null,
          paymentIntentId: null,
          amount: totalAmount,
          checkoutSessionId: null,
        });

        const intentResponse = await fetch('/api/payments/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            type,
            items: type === 'cart' ? cartItems : undefined,
            planId: type === 'plan' ? planId : undefined,
            shippingInfo: type === 'cart' ? shippingInfo : undefined,
          }),
        });

        if (!intentResponse.ok) {
          const error = await intentResponse.json();
          throw new Error(error.error || 'Error al crear el pago');
        }

        const { clientSecret, paymentIntentId, checkoutSessionId } = await intentResponse.json();
        onStripeIntentChange({
          clientSecret,
          paymentIntentId,
          amount: totalAmount,
          checkoutSessionId: checkoutSessionId || null,
        });
      } catch (error) {
        console.error(error);
        toast.error('No se pudo iniciar el pago con Stripe');
        onStripeIntentChange({
          clientSecret: null,
          paymentIntentId: null,
          amount: null,
          checkoutSessionId: null,
        });
      } finally {
        onStripeIntentLoadingChange(false);
      }
    };

    createStripeIntent();
  }, [
    paymentMethod,
    stripeKey,
    totalAmount,
    type,
    planId,
    cartItems,
    shippingInfo,
    stripeClientSecret,
    stripePaymentIntentId,
    stripeIntentLoading,
    stripeIntentAmount,
    onStripeIntentChange,
    onStripeIntentLoadingChange,
    fitnessProfileLoading,
    requiresFitnessProfile,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'plan' && requiresFitnessProfile) {
      toast.error('Completa tu perfil fitness antes de comprar un plan');
      return;
    }

    if (paymentMethod === 'stripe' && (!stripe || !elements)) {
      toast.error('Stripe no está cargado correctamente');
      return;
    }

    if (type === 'cart' && !validateShippingInfo()) {
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'stripe') {
        // ========== PAGO CON STRIPE ==========
        if (!stripeKey || !stripe || !elements) {
          throw new Error('Stripe no está listo. Verifica la clave pública y la carga de Stripe.js');
        }
        if (!stripeClientSecret || !stripePaymentIntentId) {
          throw new Error('Stripe no está listo. Intenta de nuevo en unos segundos.');
        }

        const { error: submitError } = await elements.submit();
        if (submitError) {
          throw new Error(submitError.message || 'Completa los datos del pago');
        }

        // 1. Confirmar el pago con Stripe
        const { error: stripeError, paymentIntent } = await stripe!.confirmPayment({
          elements: elements!,
          clientSecret: stripeClientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success`,
            payment_method_data: {
              billing_details: {
                email: type === 'cart' ? shippingInfo.email : session?.user?.email || '',
                ...(type === 'cart' && {
                  phone: shippingInfo.phone,
                  address: {
                    line1: shippingInfo.address,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    postal_code: shippingInfo.postalCode,
                  },
                }),
              },
            },
          },
          redirect: 'if_required',
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (paymentIntent?.status !== 'succeeded') {
          throw new Error('El pago no se completó correctamente');
        }

        // 3. Confirmar en el servidor y crear orden
        const confirmResponse = await fetch('/api/payments/stripe/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: stripePaymentIntentId,
            type,
            items: type === 'cart' ? cartItems : undefined,
            planId: type === 'plan' ? planId : undefined,
            shippingInfo: type === 'cart' ? shippingInfo : undefined,
            checkoutSessionId: stripeCheckoutSessionId,
          }),
        });

        if (!confirmResponse.ok) {
          throw new Error('Error al confirmar la orden');
        }

        const result = await confirmResponse.json();

        // Éxito
        toast.success(result.message);
        
        if (type === 'cart') {
          clearCart();
        }

        // Redirigir a página de éxito
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${result.orderId}`);
        }, 1500);

      } else if (paymentMethod === 'mercadopago') {
        // ========== PAGO CON MERCADOPAGO ==========
        const preferenceResponse = await fetch('/api/payments/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            type,
            items: type === 'cart' ? cartItems : undefined,
            planId: type === 'plan' ? planId : undefined,
            shippingInfo: type === 'cart' ? shippingInfo : undefined,
          }),
        });

        if (!preferenceResponse.ok) {
          const error = await preferenceResponse.json();
          throw new Error(error.error || 'Error al crear la preferencia de pago');
        }

        const { initPoint, sandboxInitPoint } = await preferenceResponse.json();
        const redirectUrl = initPoint || sandboxInitPoint;

        if (!redirectUrl) {
          throw new Error('No se recibió la URL de redirección de MercadoPago');
        }

        // Redirigir a MercadoPago
        window.location.href = redirectUrl;
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el pago');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      {type === 'plan' && <FitnessProfileGate forceComplete />}
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
            Finalizar Compra
          </h1>
          <p className="text-slate-600 text-lg">
            Completa tu pedido de forma segura y rápida
          </p>
          <div className="w-24 h-1 bg-linear-to-r from-indigo-600 to-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {type === 'plan' && requiresFitnessProfile && (
          <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-900">
            <p className="text-sm font-semibold">
              Antes de continuar, completa tu perfil fitness para que el instructor pueda crear tu plan.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Componente de Resumen */}
          <div className="order-1">
            <CheckoutSummary
              type={type}
              cartItems={cartItems}
              plan={plan}
              onRemoveItem={isBuyNow ? () => undefined : removeFromCart}
              calculateTotal={() => totalAmount}
            />
          </div>

          {/* Componente de Formulario de Pago */}
          <div className="order-2">
            <CheckoutPaymentForm
              type={type}
              shippingInfo={shippingInfo}
              paymentMethod={paymentMethod}
              loading={loading}
              cartItemsCount={cartItems.length}
              hasPlan={!!plan}
              totalAmount={totalAmount}
              currency={currency}
              hasStripeElements={!!(stripe && elements)}
              stripeAvailable={!!stripeKey}
              stripeClientSecret={stripeClientSecret}
              stripeIntentLoading={stripeIntentLoading}
              onShippingChange={handleShippingChange}
              onPaymentMethodChange={handlePaymentMethodChange}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper con Suspense y Elements
const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') || 'cart') as 'cart' | 'plan';
  const planId = searchParams.get('planId') || undefined;
  const buyNowItemId = searchParams.get('buyNowId') || undefined;
  const buyNowQuantityParam = searchParams.get('qty');
  const buyNowQuantity = buyNowQuantityParam ? Number(buyNowQuantityParam) : undefined;

  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string | null>(null);
  const [stripeIntentAmount, setStripeIntentAmount] = useState<number | null>(null);
  const [stripeCheckoutSessionId, setStripeCheckoutSessionId] = useState<string | null>(null);
  const [stripeIntentLoading, setStripeIntentLoading] = useState(false);

  const handleStripeIntentChange = (payload: {
    clientSecret: string | null;
    paymentIntentId: string | null;
    amount: number | null;
    checkoutSessionId: string | null;
  }) => {
    setStripeClientSecret(payload.clientSecret);
    setStripePaymentIntentId(payload.paymentIntentId);
    setStripeIntentAmount(payload.amount);
    setStripeCheckoutSessionId(payload.checkoutSessionId);
  };

  const stripeElementsOptions = stripeClientSecret
    ? {
        clientSecret: stripeClientSecret,
        appearance: {
          theme: 'stripe' as const,
        },
      }
    : undefined;

  const elementsKey = stripeClientSecret ? `stripe-${stripeClientSecret}` : 'stripe-empty';

  return (
    <Elements key={elementsKey} stripe={stripePromise} options={stripeElementsOptions}>
      <CheckoutForm
        type={type}
        planId={planId}
        buyNowItemId={buyNowItemId}
        buyNowQuantity={Number.isFinite(buyNowQuantity) ? buyNowQuantity : undefined}
        stripeClientSecret={stripeClientSecret}
        stripePaymentIntentId={stripePaymentIntentId}
        stripeIntentAmount={stripeIntentAmount}
        stripeCheckoutSessionId={stripeCheckoutSessionId}
        stripeIntentLoading={stripeIntentLoading}
        onStripeIntentChange={handleStripeIntentChange}
        onStripeIntentLoadingChange={setStripeIntentLoading}
      />
    </Elements>
  );
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPage />
    </Suspense>
  );
}

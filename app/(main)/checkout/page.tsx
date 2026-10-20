'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js/pure';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';
import CheckoutSummary from './components/CheckoutSummary';
import CheckoutPaymentForm from './components/CheckoutPaymentForm';
import { EMPTY_CARD } from './components/DemoCardForm';
import PaymentProgress, { type PaymentStage } from './components/PaymentProgress';
import { usePaymentMode } from '@/context/PaymentModeContext';
import { validateCard, type CardInput } from '@/lib/payments/card';
import { ItemUI } from '@/app/src/types/item';
import FitnessProfileGate from '@/components/others/FitnessProfileGate';
import { errorMessage } from "@/lib/utils";

// En modo demo nunca se carga Stripe.js: la clave solo se usa con PAYMENT_MODE=live.
const publicStripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

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
  discount?: number | null;
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
  demo,
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
  demo: boolean;
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
  const { cart: contextCart, clearCart, removeFromCart, syncPrices } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const stripeKey = demo ? undefined : publicStripeKey;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  // Total calculado por el servidor: es el único que se muestra y se cobra
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mercadopago'>('stripe');
  const isBuyNow = Boolean(buyNowItemId);
  const [fitnessProfileLoading, setFitnessProfileLoading] = useState(false);
  const [requiresFitnessProfile, setRequiresFitnessProfile] = useState(false);

  // Pago simulado (modo demo)
  const [card, setCard] = useState<CardInput>(EMPTY_CARD);
  const [invalidCardField, setInvalidCardField] = useState<keyof CardInput | null>(null);
  const [stage, setStage] = useState<PaymentStage | null>(null);
  // Orden PENDING ya creada para este pedido: un rechazo permite reintentar sin duplicarla
  const demoOrderRef = useRef<{ key: string; orderId: number; guestToken: string | null } | null>(null);

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
      } catch {
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
    if (!demo && !stripeKey && paymentMethod === 'stripe') {
      toast.error('Stripe no está configurado. Usa MercadoPago o agrega la clave pública.');
      setPaymentMethod('mercadopago');
    }
  }, [paymentMethod, demo, stripeKey]);

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

  // Solo cambia cuando cambian los productos o cantidades (no por actualizaciones de precio)
  const quoteKey = useMemo(() => {
    if (type === 'plan') return plan ? `plan:${plan.id}` : null;
    if (cartItems.length === 0) return null;
    return cartItems.map((item) => `${item.id}x${item.quantity}`).join(',');
  }, [type, cartItems, plan]);

  // Cotizar con el servidor: sus precios y total mandan; si difieren de los del cliente se corrigen
  useEffect(() => {
    if (!quoteKey) {
      setServerTotal(null);
      return;
    }
    let active = true;
    setServerTotal(null);

    const loadQuote = async () => {
      try {
        const response = await fetch('/api/checkout/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            type === 'plan'
              ? { type, planId }
              : { type, items: cartItems.map((item) => ({ id: item.id, quantity: item.quantity })) }
          ),
        });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) {
          toast.error(data.error || 'No se pudo calcular el total');
          return;
        }

        let priceChanged = false;
        if (data.type === 'plan') {
          const serverPlan = data.plan as { price: number; discount: number | null };
          if (plan && (plan.price !== serverPlan.price || (plan.discount ?? 0) !== (serverPlan.discount ?? 0))) {
            priceChanged = true;
            setPlan({ ...plan, price: serverPlan.price, discount: serverPlan.discount });
          }
        } else {
          const fresh = (data.lines as { productId: number; listPrice: number; discount: number | null }[]).map(
            (line) => ({ id: line.productId, price: line.listPrice, discount: line.discount })
          );
          priceChanged = cartItems.some((item) => {
            const current = fresh.find((line) => line.id === item.id);
            return !!current && (current.price !== item.price || (current.discount ?? 0) !== (item.discount ?? 0));
          });
          if (priceChanged) {
            setCartItems((items) =>
              items.map((item) => {
                const current = fresh.find((line) => line.id === item.id);
                return current ? { ...item, price: current.price, discount: current.discount ?? 0 } : item;
              })
            );
            if (!isBuyNow) syncPrices(fresh);
          }
        }
        if (priceChanged) {
          toast('Actualizamos algunos precios de tu pedido', { icon: 'ℹ️' });
        }
        setServerTotal(data.total);
      } catch (error) {
        if (active) {
          console.error(error);
          toast.error('No se pudo calcular el total');
        }
      }
    };

    loadQuote();
    return () => {
      active = false;
    };
    // cartItems/plan solo se leen para armar la petición; quoteKey ya identifica su contenido
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey, type, planId, isBuyNow, syncPrices]);

  // 0 mientras el servidor no responde: no se inicia ningún pago sin un total válido
  const totalAmount = serverTotal ?? 0;

  // Variable para moneda
  const currency = 'COP';

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

  const handleDemoSubmit = async () => {
    if (type === 'plan' && requiresFitnessProfile) {
      toast.error('Completa tu perfil fitness antes de comprar un plan');
      return;
    }
    if (type === 'cart' && !validateShippingInfo()) return;

    const validation = validateCard(card);
    if (!validation.ok) {
      setInvalidCardField(validation.field);
      toast.error(validation.message);
      return;
    }
    setInvalidCardField(null);

    // Con "reducir movimiento" los pasos avanzan sin pausas largas
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, reduceMotion ? 150 : ms));

    setLoading(true);
    setStage({ step: 0, result: 'running' });
    try {
      await pause(900); // Validando datos

      const orderKey = JSON.stringify({
        type,
        planId,
        items: type === 'cart' ? cartItems.map((item) => [item.id, item.quantity]) : null,
        shipping: type === 'cart' ? shippingInfo : null,
      });
      const createOrder = async () => {
        const created = await fetch('/api/payments/demo/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            items: type === 'cart' ? cartItems.map((item) => ({ id: item.id, quantity: item.quantity })) : undefined,
            planId: type === 'plan' ? planId : undefined,
            shippingInfo: type === 'cart' ? shippingInfo : undefined,
          }),
        });
        const createdData = await created.json().catch(() => ({}));
        if (!created.ok) throw new Error(createdData.error || 'No se pudo crear el pedido');
        const next = { key: orderKey, orderId: createdData.orderId, guestToken: createdData.guestToken ?? null };
        demoOrderRef.current = next;
        return next;
      };
      const confirmOrder = (target: { orderId: number; guestToken: string | null }) =>
        Promise.all([
          fetch('/api/payments/demo/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: target.orderId, guestToken: target.guestToken, card }),
          }),
          pause(1200),
        ]).then(([response]) => response);

      let order = demoOrderRef.current;
      if (!order || order.key !== orderKey) order = await createOrder();

      setStage({ step: 1, result: 'running' }); // Verificando con el banco
      let confirmResponse = await confirmOrder(order);
      // La orden abandonada expiró (410): se crea una nueva y se reintenta una vez
      if (confirmResponse.status === 410) {
        demoOrderRef.current = null;
        order = await createOrder();
        confirmResponse = await confirmOrder(order);
      }
      const confirmData = await confirmResponse.json().catch(() => ({}));

      if (confirmResponse.status === 402) {
        setStage({ step: 2, result: 'declined', reason: confirmData.error });
        return;
      }
      if (!confirmResponse.ok) {
        if (confirmResponse.status === 410) demoOrderRef.current = null;
        throw new Error(confirmData.error || 'Error al confirmar el pago');
      }

      setStage({ step: 2, result: 'running' }); // Autorizando pago
      await pause(1000);
      setStage({ step: 3, result: 'approved' }); // Pago aprobado
      await pause(1100);

      const token = order.guestToken ? `&t=${encodeURIComponent(order.guestToken)}` : '';
      demoOrderRef.current = null;
      router.push(`/checkout/success?orderId=${order.orderId}${token}`);
      if (type === 'cart' && !isBuyNow) clearCart();
    } catch (error) {
      setStage(null);
      toast.error(errorMessage(error, 'Error al procesar el pago'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (demo) {
      await handleDemoSubmit();
      return;
    }

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
    } catch (error) {
      toast.error(errorMessage(error, 'Error al procesar el pago'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg py-10 px-4 sm:px-6 lg:px-8 md:py-14">
      {type === 'plan' && <FitnessProfileGate forceComplete />}
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="section-heading">
            <h1 className="text-5xl md:text-7xl">Finalizar compra</h1>
          </div>
          <p className="mt-4 text-lg text-muted">Completa tu pedido de forma segura y rápida.</p>
        </div>

        {type === 'plan' && requiresFitnessProfile && (
          <div className="mb-10 border border-warn bg-warn/10 px-6 py-5 text-warn">
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
              calculateTotal={() => serverTotal}
            />
          </div>

          {/* Componente de Formulario de Pago */}
          <div className="order-2">
            <CheckoutPaymentForm
              type={type}
              shippingInfo={shippingInfo}
              paymentMethod={paymentMethod}
              demo={demo}
              card={card}
              onCardChange={(next) => {
                setCard(next);
                setInvalidCardField(null);
              }}
              invalidCardField={invalidCardField}
              loading={loading}
              cartItemsCount={cartItems.length}
              hasPlan={!!plan}
              totalAmount={totalAmount}
              totalReady={serverTotal !== null}
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
      <PaymentProgress stage={stage} amount={totalAmount} onRetry={() => setStage(null)} />
    </div>
  );
};

// Wrapper con Suspense y Elements
const CheckoutPage = () => {
  const demo = usePaymentMode() === 'demo';
  // Stripe.js solo se descarga en modo live y con clave pública
  const stripePromise = useMemo(
    () => (!demo && publicStripeKey ? loadStripe(publicStripeKey) : null),
    [demo]
  );
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
          theme: 'night' as const,
          variables: {
            colorPrimary: '#ff4d14',
            colorBackground: '#1a1a1d',
            colorText: '#f5f3ef',
            colorDanger: '#ff6161',
            borderRadius: '0px',
            fontFamily: 'Barlow, system-ui, sans-serif',
          },
        },
      }
    : undefined;

  const elementsKey = stripeClientSecret ? `stripe-${stripeClientSecret}` : 'stripe-empty';

  return (
    <Elements key={elementsKey} stripe={stripePromise} options={stripeElementsOptions}>
      <CheckoutForm
        demo={demo}
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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-muted">Cargando checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPage />
    </Suspense>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';
import CheckoutSummary from './components/CheckoutSummary';
import CheckoutPaymentForm from './components/CheckoutPaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  state: string;
}

const CheckoutForm = ({ type, planId }: { type: 'cart' | 'plan'; planId?: string }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart: contextCart, clearCart, removeFromCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mercadopago'>('stripe');

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    email: session?.user?.email || '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    state: '',
  });

  // Verificar autenticación solo para planes
  useEffect(() => {
    if (type === 'plan' && status === 'unauthenticated') {
      toast.error('Debes iniciar sesión para suscribirte a un plan');
      router.push(`/login?callbackUrl=/checkout?type=plan&planId=${planId}`);
    }
  }, [type, status, router, planId]);

  // Cargar datos según tipo
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type === 'cart') {
          setCartItems(contextCart);
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
  }, [type, planId, contextCart]);

  // Calcular total
  const calculateTotal = () => {
    if (type === 'cart') {
      return cartItems.reduce((sum, item) => {
        const itemPrice = item.discount
          ? Math.round(item.price * (1 - item.discount / 100))
          : item.price;
        return sum + itemPrice * item.quantity;
      }, 0);
    }
    return plan?.price || 0;
  };

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
    const { email, phone, address, postalCode, city, state } = shippingInfo;
    if (!email || !phone || !address || !postalCode || !city || !state) {
      toast.error('Por favor completa todos los campos de envío');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Email inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        const { CardElement } = await import('@stripe/react-stripe-js');
        const cardElement = elements?.getElement(CardElement);

        if (!cardElement) {
          throw new Error('Elemento de tarjeta no encontrado');
        }

        // 1. Crear Payment Intent
        const intentResponse = await fetch('/api/payments/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: calculateTotal(),
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

        const { clientSecret, paymentIntentId } = await intentResponse.json();

        // 2. Confirmar el pago con Stripe
        const { error: stripeError, paymentIntent } = await stripe!.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
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
          }
        );

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
            paymentIntentId,
            type,
            items: type === 'cart' ? cartItems : undefined,
            planId: type === 'plan' ? planId : undefined,
            shippingInfo: type === 'cart' ? shippingInfo : undefined,
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
            amount: calculateTotal(),
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

        const { initPoint } = await preferenceResponse.json();

        // Redirigir a MercadoPago
        window.location.href = initPoint;
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Componente de Resumen */}
          <div className="order-2 lg:order-1">
            <CheckoutSummary
              type={type}
              cartItems={cartItems}
              plan={plan}
              onRemoveItem={removeFromCart}
              calculateTotal={calculateTotal}
            />
          </div>

          {/* Componente de Formulario de Pago */}
          <div className="order-1 lg:order-2">
            <CheckoutPaymentForm
              type={type}
              shippingInfo={shippingInfo}
              paymentMethod={paymentMethod}
              loading={loading}
              cartItemsCount={cartItems.length}
              hasPlan={!!plan}
              totalAmount={calculateTotal()}
              currency={currency}
              hasStripeElements={!!(stripe && elements)}
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

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm type={type} planId={planId} />
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

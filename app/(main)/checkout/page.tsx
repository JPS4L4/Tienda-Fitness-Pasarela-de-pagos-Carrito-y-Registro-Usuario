'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';

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

const CheckoutForm = ({ type, planId }: { type: string; planId?: string }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart: contextCart, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mercadopago'>('stripe');
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    state: '',
  });

  // Verificar autenticación para planes
  useEffect(() => {
    if (type === 'plan' && status === 'unauthenticated') {
      toast.error('Debes iniciar sesión para suscribirte a un plan');
      router.push(`/login?callbackUrl=/checkout?type=plan&planId=${planId}`);
    }
  }, [type, status, router, planId]);

  // Cargar datos según el tipo
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type === 'cart') {
          // Obtener items del carrito desde el contexto
          setCartItems(contextCart);
        } else if (type === 'plan' && planId) {
          // Obtener datos del plan
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

  // Manejar cambios en formulario de envío
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  // Validar formulario de envío
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

  // Procesar pago
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar Stripe solo si el método de pago es stripe
    if (paymentMethod === 'stripe' && (!stripe || !elements)) {
      toast.error('Stripe no está cargado correctamente');
      return;
    }

    // Validar datos para carrito
    if (type === 'cart' && !validateShippingInfo()) {
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'stripe') {
        // Verificación de tipo segura para stripe y elements
        if (!stripe || !elements) {
          throw new Error('Stripe no está cargado correctamente');
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Elemento de tarjeta no encontrado');
        }

        // Crear orden en backend
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            planId,
            items: type === 'cart' ? cartItems : undefined,
            shippingInfo: type === 'cart' ? shippingInfo : undefined,
            total: calculateTotal(),
          }),
        });

        if (!orderResponse.ok) {
          const error = await orderResponse.json();
          throw new Error(error.message || 'Error al crear la orden');
        }

        const { orderId, clientSecret } = await orderResponse.json();

        // Confirmar pago con Stripe
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                email: type === 'cart' ? shippingInfo.email : session?.user?.email,
              },
            },
          }
        );

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (paymentIntent?.status === 'succeeded') {
          // Confirmar orden en backend
          await fetch(`/api/orders/${orderId}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          });

          toast.success('¡Pago procesado exitosamente!');
          
          if (type === 'cart') {
            clearCart(); // Limpiar carrito del contexto
            router.push(`/orders/${orderId}`);
          } else {
            router.push('/profile?tab=subscriptions');
          }
        }
      } else {
        // Integración con Mercado Pago
        const response = await fetch('/api/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            planId,
            items: type === 'cart' ? cartItems : undefined,
            shippingInfo: type === 'cart' ? shippingInfo : undefined,
            total: calculateTotal(),
          }),
        });

        const { preferenceId } = await response.json();
        
        // Redirigir a Mercado Pago
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el pago');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (type === 'plan' && status === 'loading') {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen p-4 lg:p-8">
      {/* Columna izquierda - Resumen */}
      <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-lg p-6 lg:p-8 h-fit">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Resumen de Compra</h2>
        
        {type === 'cart' ? (
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <p className="text-gray-500">Tu carrito está vacío</p>
            ) : (
              <>
                {cartItems.map((item) => {
                  const itemPrice = item.discount
                    ? Math.round(item.price * (1 - item.discount / 100))
                    : item.price;
                  const subtotal = itemPrice * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex justify-between items-center border-b pb-4">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                          {item.discount && (
                            <p className="text-xs text-green-600">-{item.discount}% descuento</p>
                          )}
                        </div>
                      </div>
                      <p className="font-bold">${subtotal.toFixed(2)}</p>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-4 border-t-2">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        ) : plan ? (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
              {plan.description && <p className="text-gray-600 mb-4">{plan.description}</p>}
              <ul className="space-y-2">
                {plan.coverage.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">${plan.price.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Cargando...</p>
        )}
      </div>

      {/* Columna derecha - Formulario y pago */}
      <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-lg p-6 lg:p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {type === 'cart' ? 'Información de Envío' : 'Información de Pago'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Formulario de envío solo para carrito */}
          {type === 'cart' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Teléfono *</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dirección *</label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Código Postal *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Municipio *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Departamento *</label>
                <input
                  type="text"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium mb-4">Método de Pago</label>
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'stripe'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Tarjeta (Stripe)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('mercadopago')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'mercadopago'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Mercado Pago
              </button>
            </div>

            {paymentMethod === 'stripe' && (
              <div className="p-4 border rounded-lg">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              loading || 
              (paymentMethod === 'stripe' && (!stripe || !elements)) ||
              (type === 'cart' && cartItems.length === 0) || 
              (type === 'plan' && !plan)
            }
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Procesando...' : 
             (paymentMethod === 'stripe' && (!stripe || !elements)) ? 'Cargando Stripe...' :
             `Pagar $${calculateTotal().toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'cart';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPage />
    </Suspense>
  );
}
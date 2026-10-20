# Pagos

La tienda cobra en COP y tiene dos modos, elegidos con `PAYMENT_MODE` (ver `.env.example`):

| Modo | Qué hace |
|---|---|
| `demo` (por defecto, también si la variable falta) | Todo simulado: tarjeta de prueba con animación por pasos, correo de confirmación en pantalla y seguimiento de envío derivado del tiempo. **No se llama a Stripe, Mercado Pago ni Resend**; las rutas de las pasarelas responden 404. |
| `live` | Pagos reales con Stripe / Mercado Pago (siempre con claves de **prueba** en este proyecto), descritos abajo. |

## Modo demo

- `POST /api/payments/demo/create-order` crea la orden `PENDING` (precio calculado en el servidor) y, si es de invitado, devuelve un token firmado (`HMAC` con `NEXTAUTH_SECRET`, 7 días) que da acceso a esa orden.
- `POST /api/payments/demo/confirm` valida la tarjeta (Luhn, vencimiento, CVC) y simula el resultado; si se aprueba reutiliza `fulfillOrder` con el método `DEMO` (stock y suscripción como en el modo live). La tarjeta no se guarda: solo los 4 últimos dígitos, dentro del `paymentId` (`demo_<aleatorio>_<4 dígitos>`).
- Tarjetas de prueba: `4242 4242 4242 4242` aprobada; `4000 0000 0000 0002` rechazada (fondos insuficientes); `4000 0000 0000 9995` rechazada por el banco; cualquier otro número válido se aprueba. Un rechazo deja la orden `PENDING` para reintentar.
- El envío (guía, etapas, entrega estimada) se calcula en `lib/orders/shipping.ts` desde el id y la hora del pago, sin escribir en la base de datos; los planes muestran "Acceso activado".
- El comprobante de invitados se abre con `/checkout/success?orderId=…&t=<token>`; sin token válido la orden responde 404.

## Modo live

## Variables

| Variable | Para qué |
|---|---|
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Pago con tarjeta (claves `sk_test_` / `pk_test_`) |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook de Stripe (`whsec_...`). Sin ella el webhook responde 503 |
| `MERCADOPAGO_ACCESS_TOKEN` | Crear preferencias de pago (credencial de prueba) |
| `MERCADOPAGO_RETURN_URL`, `MERCADOPAGO_NOTIFICATION_URL` | Vuelta del usuario y notificaciones (HTTPS público) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Si existe, se exige la firma `x-signature` |

## Webhooks

- Stripe: registrar `https://TU_DOMINIO/api/payments/stripe/webhook` para el evento `payment_intent.succeeded`.
  En local: `stripe listen --forward-to localhost:3000/api/payments/stripe/webhook`.
- Mercado Pago: configurar `https://TU_DOMINIO/api/payments/mercadopago/webhook` (evento Pagos) en
  *Tus integraciones > Webhooks*. En local hace falta un túnel HTTPS.

## Tarjetas de prueba

- **Stripe** ([documentación](https://docs.stripe.com/testing)): `4242 4242 4242 4242`, fecha futura, CVC de 3 dígitos.
  Rechazo genérico: `4000 0000 0000 0002`.
- **Mercado Pago Colombia** ([documentación](https://www.mercadopago.com.co/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards)):
  Mastercard `5254 1336 7440 3564` o Visa `4013 5406 8274 6260`, vencimiento `11/30`, CVV `123`,
  titular `APRO` (pago aprobado) y documento `123456789`.

## Flujo

1. El cliente envía solo identificadores y cantidades; el servidor calcula el monto desde la base de datos.
2. Stripe: se crea un `PaymentIntent`; Mercado Pago: se crea una preferencia y el usuario es redirigido.
3. La pasarela confirma el pago por webhook firmado (o por la confirmación verificada contra la API de Stripe).
4. `fulfillOrder` pasa la orden de `PENDING` a `COMPLETED` con un `UPDATE` condicional (idempotente),
   descuenta stock o crea la suscripción y avisa al instructor.

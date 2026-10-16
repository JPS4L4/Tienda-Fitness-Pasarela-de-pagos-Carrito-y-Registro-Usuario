# Pagos

La tienda cobra en COP con dos pasarelas, siempre en **modo prueba** en este proyecto. Las claves van en `.env` (ver `.env.example`).

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

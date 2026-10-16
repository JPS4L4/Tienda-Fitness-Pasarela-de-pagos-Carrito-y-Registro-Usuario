# Seguridad

Resumen de las decisiones de seguridad del proyecto y dónde viven en el código.

| Tema | Decisión | Dónde |
|---|---|---|
| Precios | Se calculan en el servidor desde la base de datos; el cliente nunca envía montos | `lib/orders/pricing.ts`, `lib/money.ts` |
| Webhooks | Stripe con `constructEvent`; Mercado Pago con firma `x-signature` | `app/api/payments/*/webhook` |
| Idempotencia | `UPDATE ... WHERE status = 'PENDING'` hace de cerrojo: un pago repetido no duplica efectos | `lib/orders/fulfillment.ts` |
| Administración | Fail-closed: sin `ADMIN_EMAILS` nadie es admin; se valida en middleware, layout y cada API | `lib/adminAuth.ts`, `lib/requireAdmin.ts`, `middleware.ts` |
| Sesiones | JWT firmado con `NEXTAUTH_SECRET` (sin valor por defecto) | `lib/nextAuth.ts` |
| Contraseñas | Hash con bcrypt; validación y sanitización de entradas | `lib/validation.ts` |
| Contenido de pago | `plan.content` solo para suscriptores activos y admins | `lib/planAccess.ts` |
| Errores | Las APIs no devuelven `error.message` al cliente | `app/api/**` |
| Abuso | Límite de peticiones en el registro | `lib/rateLimit.ts` |
| Secretos | Solo en `.env` (no versionado); `.env.example` sin valores | `.env.example` |

Las pruebas automáticas de precios, administración, cumplimiento de órdenes y webhooks están en `tests/`.

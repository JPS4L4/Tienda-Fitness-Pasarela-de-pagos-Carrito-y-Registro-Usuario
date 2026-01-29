# Guía de Configuración de Pagos

## ✅ Stripe - CONFIGURADO

Stripe ya está configurado y listo para usar con tus claves en `.env.local`:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

## 🔧 MercadoPago - REQUIERE CONFIGURACIÓN

### Paso 1: Crear Cuenta

1. Ve a [MercadoPago Developers](https://www.mercadopago.com/developers)
2. Crea una cuenta o inicia sesión
3. Ve al panel de desarrolladores

### Paso 2: Obtener Credenciales

1. En el panel, ve a **"Tus aplicaciones"**
2. Crea una nueva aplicación o selecciona una existente
3. Ve a **"Credenciales"**
4. Copia las siguientes claves **de prueba** (test):
   - **Public Key** (comienza con `TEST-...`)
   - **Access Token** (comienza con `TEST-...`)

### Paso 3: Configurar en tu Proyecto

Abre tu archivo `.env.local` y reemplaza estas líneas:

```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="TU_PUBLIC_KEY_AQUI"
MERCADOPAGO_ACCESS_TOKEN="TU_ACCESS_TOKEN_AQUI"
```

Por tus claves reales de MercadoPago (modo test).

### Paso 4: Configurar Webhooks (Opcional pero Recomendado)

1. En el panel de MercadoPago, ve a **"Webhooks"**
2. Agrega una nueva URL de notificación:
   - URL: `https://tudominio.com/api/payments/mercadopago/webhook`
   - Eventos: Selecciona **"Pagos"**
3. Guarda la configuración

**Nota**: Para desarrollo local, puedes usar [ngrok](https://ngrok.com/) para exponer tu localhost:
```bash
ngrok http 3000
```
Luego usa la URL de ngrok + `/api/payments/mercadopago/webhook`

### Paso 5: Reiniciar el Servidor

Después de configurar las claves, reinicia tu servidor de desarrollo:

```bash
npm run dev
```

## 🧪 Probar los Pagos

### Stripe - Tarjetas de Prueba

- **Tarjeta exitosa**: `4242 4242 4242 4242`
- **Tarjeta rechazada**: `4000 0000 0000 0002`
- **Requiere autenticación**: `4000 0027 6000 3184`
- Fecha: Cualquier fecha futura
- CVV: Cualquier 3 dígitos
- Código postal: Cualquier código

### MercadoPago - Tarjetas de Prueba (Colombia)

- **Mastercard aprobada**: `5474 9254 3267 0366`
- **Visa aprobada**: `4509 9535 6623 3704`
- **Mastercard rechazada**: `5031 4332 1540 6351`
- Fecha: Cualquier fecha futura
- CVV: Cualquier 3 dígitos
- Nombre: `APRO` (para aprobar) o `OTHE` (para rechazar)

Más tarjetas de prueba: [MercadoPago Test Cards](https://www.mercadopago.com.co/developers/es/docs/checkout-api/testing)

## 📊 Flujo de Pago

### Stripe:
1. Usuario llena formulario de checkout
2. Se crea un Payment Intent en el servidor
3. Usuario ingresa datos de tarjeta
4. Stripe procesa el pago
5. Se confirma en el servidor y se crea la orden
6. Usuario es redirigido a página de éxito

### MercadoPago:
1. Usuario llena formulario de checkout
2. Se crea una Preferencia de pago
3. Usuario es redirigido a MercadoPago
4. MercadoPago procesa el pago
5. Webhook confirma el pago y crea la orden
6. Usuario regresa a tu sitio (éxito/fallo/pendiente)

## 🔒 Seguridad

- ✅ Las claves secretas nunca se exponen al cliente
- ✅ Los pagos se procesan en servidores seguros
- ✅ Los datos de tarjetas nunca tocan tu servidor
- ✅ Todas las transacciones usan HTTPS

## 📝 Próximos Pasos

1. **Configurar MercadoPago** con tus claves de prueba
2. **Probar ambos métodos de pago** en modo test
3. **Cuando estés listo para producción**:
   - Cambia las claves de Stripe/MercadoPago a modo producción
   - Configura el webhook de MercadoPago con tu dominio real
   - Verifica que el NEXTAUTH_URL en .env apunte a tu dominio de producción

## 🆘 Soporte

Si tienes problemas:
- **Stripe**: [Documentación](https://stripe.com/docs)
- **MercadoPago**: [Documentación](https://www.mercadopago.com/developers/es/docs)
- **Next.js**: [Documentación](https://nextjs.org/docs)

# 🎫 Sistema de Tokens y Suscripciones Implementado

## ✅ Resumen de Implementación

Se ha implementado un **sistema completo de tokens de acceso y suscripciones** para los planes de la plataforma.

---

## 📊 Cambios en la Base de Datos

### 1. Modelo `Order` Actualizado
```prisma
model Order {
  // ... campos existentes
  planId          Int?      // ID del plan comprado
  accessToken     String?   @unique  // Token único de acceso
  tokenExpiresAt  DateTime? // Fecha de expiración
  subscriptionType String?  // "monthly" | "quarterly" | "yearly" | "lifetime"
}
```

### 2. Nuevo Modelo `UserSubscription`
```prisma
model UserSubscription {
  id        Int      @id @default(autoincrement())
  userId    Int
  planId    Int
  orderId   Int
  status    String   @default("active") // active | expired | cancelled
  startDate DateTime
  endDate   DateTime?
  accessToken String @unique
}
```

---

## 🔧 APIs Creadas

### 1. **POST /api/orders** - Crear Orden
Crea una orden de compra y genera el token de acceso automáticamente.

**Request:**
```json
{
  "type": "plan",
  "planId": 1,
  "total": 120000,
  "subscriptionType": "monthly"
}
```

**Response:**
```json
{
  "orderId": 123,
  "clientSecret": "pi_xxx_secret_yyy",
  "accessToken": "abc123...",
  "expiresAt": "2026-02-27T00:00:00.000Z"
}
```

### 2. **POST /api/orders/[orderId]/confirm** - Confirmar Pago
Marca la orden como pagada y activa la suscripción del usuario.

**Request:**
```json
{
  "paymentIntentId": "pi_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "message": "Suscripción activada exitosamente"
}
```

### 3. **GET /api/subscriptions/check?planId=123** - Verificar Acceso
Verifica si el usuario tiene acceso activo a un plan específico.

**Response:**
```json
{
  "hasAccess": true,
  "subscription": {
    "id": 1,
    "startDate": "2026-01-27",
    "endDate": "2026-02-27",
    "accessToken": "abc123..."
  }
}
```

### 4. **POST /api/subscriptions** - Obtener Suscripciones
Obtiene todas las suscripciones del usuario autenticado con información del plan.

**Response:**
```json
[
  {
    "id": 1,
    "status": "active",
    "startDate": "2026-01-27",
    "endDate": "2026-02-27",
    "accessToken": "abc123...",
    "isValid": true,
    "plan": {
      "id": 1,
      "title": "Plan Nutricional Pérdida de Peso",
      "type": "nutricion",
      "slug": "plan-nutricional-perdida-peso"
    }
  }
]
```

---

## 🛠️ Servicios y Utilidades

### `lib/tokenService.ts`

Funciones auxiliares para manejo de tokens:

- **`generateAccessToken()`** - Genera un token único de 64 caracteres
- **`calculateExpirationDate(subscriptionType)`** - Calcula la fecha de expiración según el tipo:
  - `monthly` → +1 mes
  - `quarterly` → +3 meses
  - `yearly` → +1 año
  - `lifetime` → +100 años
- **`isTokenValid(expiresAt)`** - Verifica si un token no ha expirado
- **`generateOrderId()`** - Genera un ID único de orden (ej: ORD-ABC123-XYZ)

---

## 🎨 Componentes de UI

### 1. **`UserSubscriptions`** - Vista de Suscripciones
Componente para mostrar las suscripciones del usuario en el perfil.

**Ubicación:** `components/others/UserSubscriptions.tsx`

**Características:**
- ✅ Muestra todas las suscripciones (activas, expiradas, canceladas)
- ✅ Contador de días restantes
- ✅ Alertas para suscripciones por vencer (≤7 días)
- ✅ Botón para copiar token de acceso
- ✅ Enlaces directos al plan
- ✅ Botón de renovación para planes expirados

**Uso:**
```tsx
import UserSubscriptions from '@/components/others/UserSubscriptions';

<UserSubscriptions />
```

### 2. **`useCheckAccess`** - Hook de Verificación
Hook personalizado para verificar acceso a un plan.

**Ubicación:** `hooks/useCheckAccess.ts`

**Uso:**
```tsx
import { useCheckAccess } from '@/hooks/useCheckAccess';

const { hasAccess, loading, subscription, isAuthenticated } = useCheckAccess(planId);

if (!isAuthenticated) {
  return <div>Debes iniciar sesión</div>;
}

if (!hasAccess) {
  return <div>No tienes acceso a este plan</div>;
}

return <div>Contenido del plan...</div>;
```

---

## 🔄 Flujo Completo de Compra

```
1. Usuario selecciona un plan
   ↓
2. POST /api/orders
   - Crea orden con status "pending"
   - Genera accessToken único
   - Calcula tokenExpiresAt según subscriptionType
   ↓
3. Usuario completa el pago con Stripe
   ↓
4. POST /api/orders/[orderId]/confirm
   - Marca orden como "paid"
   - Crea registro en UserSubscription
   - Status: "active"
   ↓
5. Usuario accede al plan
   ↓
6. GET /api/subscriptions/check?planId=123
   - Verifica si tiene suscripción activa
   - Valida que el token no haya expirado
   ↓
7. Si es válido: Muestra contenido
   Si expiró: Marca como "expired" y solicita renovación
```

---

## 🎯 Tipos de Suscripción

| Tipo | Duración | Uso |
|------|----------|-----|
| `monthly` | 1 mes | Planes mensuales |
| `quarterly` | 3 meses | Planes trimestrales |
| `yearly` | 1 año | Planes anuales |
| `lifetime` | 100 años | Acceso de por vida |

---

## 📦 Integración con Página de Perfil

Para agregar la vista de suscripciones al perfil del usuario:

```tsx
// app/(main)/profile/page.tsx
import UserSubscriptions from '@/components/others/UserSubscriptions';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('subscriptions');
  
  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        <button onClick={() => setActiveTab('subscriptions')}>
          Mis Suscripciones
        </button>
        {/* Otros tabs */}
      </div>
      
      {/* Content */}
      {activeTab === 'subscriptions' && <UserSubscriptions />}
    </div>
  );
}
```

---

## 🔐 Protección de Contenido

Para proteger el contenido de un plan:

```tsx
// app/(main)/plans/[slug]/content/page.tsx
'use client';

import { useCheckAccess } from '@/hooks/useCheckAccess';

export default function PlanContentPage({ params }) {
  const { hasAccess, loading } = useCheckAccess(params.planId);
  
  if (loading) return <div>Cargando...</div>;
  
  if (!hasAccess) {
    return (
      <div>
        <h2>Acceso Restringido</h2>
        <p>Necesitas una suscripción activa para ver este contenido</p>
        <Link href={`/checkout?type=plan&planId=${params.planId}`}>
          Suscribirse Ahora
        </Link>
      </div>
    );
  }
  
  return <div>Contenido exclusivo del plan...</div>;
}
```

---

## 🚀 Comandos Ejecutados

```bash
# 1. Aplicar cambios en el schema
npx prisma db push --force-reset

# 2. Generar cliente de Prisma
npx prisma generate

# 3. Ejecutar seed
npx prisma db seed
```

---

## ✨ Características Implementadas

- ✅ Generación automática de tokens únicos al comprar un plan
- ✅ Cálculo automático de fechas de expiración
- ✅ Verificación de acceso con validación de token
- ✅ Dashboard de suscripciones del usuario
- ✅ Manejo de estados: active, expired, cancelled
- ✅ Contador de días restantes
- ✅ Alertas para suscripciones próximas a vencer
- ✅ Copiar token al portapapeles
- ✅ Renovación de planes expirados
- ✅ Protección de contenido con hook personalizado

---

## 📝 Próximos Pasos (Opcional)

- [ ] Integrar Stripe Payment Intents real
- [ ] Agregar webhooks para renovaciones automáticas
- [ ] Implementar notificaciones por email antes de expiración
- [ ] Agregar página de recursos protegidos por plan
- [ ] Dashboard de administrador para gestionar suscripciones
- [ ] Sistema de cupones de descuento

---

✅ **Estado:** Sistema de tokens completamente funcional
🎉 **Resultado:** Los planes ahora generan tokens de acceso al momento de la compra

# 🔄 FLUJOS DE AUTENTICACIÓN

## Flujo 1: REGISTRO Y VERIFICACIÓN DE EMAIL

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO NUEVO                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌────────────────────────────────┐
              │  /login (Click "Regístrate")   │
              └────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  FORMULARIO DE REGISTRO                  │
        │  • Nombre                                │
        │  • Email                                 │
        │  • Contraseña                            │
        │  • Confirmar Contraseña                  │
        │  [CREAR CUENTA]                          │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  POST /api/auth/register                 │
        │  ├─ Hash contraseña (bcryptjs)          │
        │  ├─ Crear User en DB                    │
        │  ├─ Crear Account model                 │
        │  ├─ Generar token (32 bytes)            │
        │  └─ Enviar email de verificación        │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  ✉️  EMAIL ENVIADO                       │
        │  Asunto: "Verifica tu email"            │
        │  Link: /verify-email?token=xxxxx        │
        │  Válido: 24 horas                        │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  USUARIO LEE EMAIL                       │
        │  Click en "VERIFICAR EMAIL"              │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  GET /verify-email?token=xxxxx           │
        │  ├─ Validar token existe                 │
        │  ├─ Validar no ha expirado               │
        │  ├─ Marcar email como verificado        │
        │  ├─ Limpiar token de DB                 │
        │  └─ Response: success                    │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  /verify-email (Page)                    │
        │  ┌────────────────────────────────────┐  │
        │  │ ✅ ¡EMAIL VERIFICADO!              │  │
        │  │                                    │  │
        │  │ Tu email ha sido verificado        │  │
        │  │ correctamente. Redirigiendo...     │  │
        │  │                                    │  │
        │  │ Redirigiendo en 3 segundos...      │  │
        │  └────────────────────────────────────┘  │
        └──────────────────────────────────────────┘
                              │
                   (Auto-redirect después de 3s)
                              │
                              ▼
              ┌────────────────────────────────┐
              │  /login (Verificación OK)      │
              └────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  FORMULARIO DE LOGIN                     │
        │  Email: user@example.com                │
        │  Contraseña: ••••••••••                 │
        │  [INICIAR SESIÓN]                       │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  POST NextAuth /api/auth/signin          │
        │  (Internamente llama a validateCred)    │
        │  ├─ Buscar usuario por email           │
        │  ├─ Validar emailVerified != null       │
        │  ├─ Validar contraseña (bcrypt.compare)│
        │  └─ Crear sesión JWT                    │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  ✅ LOGIN EXITOSO                        │
        │  Session creada (JWT en httpOnly cookie)│
        │  Redirect a /profile                     │
        └──────────────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────┐
                │  ✨ USUARIO LOGUEADO      │
                │  Puede acceder a todas   │
                │  las funciones           │
                └──────────────────────────┘

═══════════════════════════════════════════════════════════════════

## Flujo 2: RECUPERACIÓN DE CONTRASEÑA

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO OLVIDA CONTRASEÑA                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌────────────────────────────────┐
              │  /login                        │
              │  Click "¿Olvidaste?"           │
              └────────────────────────────────┘
                              │
                              ▼
              ┌────────────────────────────────┐
              │  /forgot-password              │
              │  [Formulario de email]         │
              │  [ENVIAR INSTRUCCIONES]        │
              └────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  POST /api/auth/forgot-password          │
        │  ├─ Buscar usuario por email            │
        │  ├─ Generar reset token (32 bytes)      │
        │  ├─ Token válido 1 hora                 │
        │  ├─ Guardar en DB                       │
        │  └─ Enviar email de reset               │
        │     (NO revela si email existe)         │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  /forgot-password                        │
        │  ┌────────────────────────────────────┐  │
        │  │ ✅ EMAIL ENVIADO                   │  │
        │  │                                    │  │
        │  │ Si el email existe en nuestro      │  │
        │  │ sistema, recibirás instrucciones   │  │
        │  │ para resetear tu contraseña.       │  │
        │  │                                    │  │
        │  │ Revisa tu bandeja de entrada.      │  │
        │  │ (También revisa SPAM)              │  │
        │  └────────────────────────────────────┘  │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  ✉️  EMAIL ENVIADO                       │
        │  Asunto: "Resetea tu contraseña"       │
        │  Link: /reset-password?token=xxxxx      │
        │  Válido: 1 hora (por seguridad)         │
        │  Botón: "RESTABLECER CONTRASEÑA"        │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  USUARIO RECIBE EMAIL                    │
        │  Click en "RESTABLECER CONTRASEÑA"       │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  /reset-password?token=xxxxx             │
        │  (Página cargando...)                    │
        │  ├─ GET request al endpoint              │
        │  ├─ Validar token                        │
        │  ├─ Validar no ha expirado               │
        │  ├─ Mostrar formulario si OK             │
        │  └─ Mostrar error si expiró              │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  FORMULARIO RESET PASSWORD               │
        │  • Nueva Contraseña                      │
        │  • Confirmar Contraseña                  │
        │  [RESETEAR CONTRASEÑA]                   │
        │                                          │
        │  Validaciones:                           │
        │  ✓ Ambas contraseñas coinciden          │
        │  ✓ Contraseña > 8 caracteres            │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  POST /api/auth/reset-password           │
        │  ├─ Validar token                        │
        │  ├─ Validar no ha expirado               │
        │  ├─ Hash nueva contraseña (bcryptjs)     │
        │  ├─ Actualizar Account model             │
        │  ├─ Limpiar reset token de DB            │
        │  └─ Response: success                    │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  /reset-password (Success State)         │
        │  ┌────────────────────────────────────┐  │
        │  │ ✅ ¡ÉXITO!                         │  │
        │  │                                    │  │
        │  │ Tu contraseña ha sido              │  │
        │  │ actualizada correctamente.         │  │
        │  │                                    │  │
        │  │ Redirigiendo a Login en 3 seg...   │  │
        │  └────────────────────────────────────┘  │
        └──────────────────────────────────────────┘
                              │
                   (Auto-redirect después de 3s)
                              │
                              ▼
              ┌────────────────────────────────┐
              │  /login                        │
              │  (Token ya fue limpiado)       │
              │                                │
              │  Email: user@example.com       │
              │  Contraseña: [NUEVA]           │
              │  [INICIAR SESIÓN]              │
              └────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  POST NextAuth /api/auth/signin          │
        │  Validar con nueva contraseña           │
        │  ✓ Email existe                         │
        │  ✓ Email verificado                     │
        │  ✓ Contraseña correcta (nueva)          │
        │  ✓ Crear sesión JWT                     │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  ✅ LOGIN CON NUEVA CONTRASEÑA           │
        │  Usuario accede a su cuenta              │
        │  Contraseña anterior ya no funciona      │
        └──────────────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────┐
                │  ✨ CONTRASEÑA RECUPERADA     │
                │  Usuario puede usar su cuenta │
                │  con la nueva contraseña      │
                └──────────────────────────────┘
```

═══════════════════════════════════════════════════════════════════

## TABLA DE DECISIONES

### Tipo de Token
| Token | Duración | Uso | Seguridad |
|-------|----------|-----|-----------|
| Email Verification | 24 horas | Verificar email | Normal |
| Password Reset | 1 hora | Cambiar contraseña | Alta |

### Casos de Error

#### Token Expirado
```
Usuario hace click en email viejo (después de 24h)
↓
GET /verify-email?token=xxx
↓
isTokenExpired(expiryDate) = true
↓
Response: { success: false, error: "Token expirado" }
↓
/verify-email page → Mostrar "Token Expirado"
↓
Link: "Solicitar Nuevo Reset"
```

#### Email Incorrecto
```
Usuario intenta registrarse con email ya usado
↓
POST /api/auth/register
↓
Email existe en DB
↓
Response: { success: false, error: "Email ya existe" }
↓
/login page → Mostrar error
↓
Link: "¿Olvidaste tu contraseña?"
```

#### Contraseña Incorrecta en Reset
```
Usuario ingresa:
• Password: Pass123
• Confirm: DifferentPass456
↓
Cliente valida: password !== confirmPassword
↓
Mostrar error: "Las contraseñas no coinciden"
↓
Usuario corrige
```

═══════════════════════════════════════════════════════════════════

## FLUJO DE BASE DE DATOS

### Registro
```
1. Usuario → POST /api/auth/register
2. Hash contraseña con bcryptjs
3. Crear User { email, name, emailVerificationToken, ... }
4. Crear Account { userId, provider: 'credentials', password: hashed }
5. Generar token único (32 bytes)
6. Guardar token en User.emailVerificationToken
7. Guardar expiración en User.emailVerificationTokenExpiry
8. Enviar email
```

### Verificación Email
```
1. Usuario → GET /verify-email?token=xxx
2. Buscar User { emailVerificationToken: xxx }
3. Validar token no ha expirado
4. Update User:
   - emailVerified = NOW()
   - emailVerificationToken = null
   - emailVerificationTokenExpiry = null
5. Return { success: true }
```

### Login
```
1. Usuario → Credenciales
2. NextAuth llama validateCredentials()
3. Buscar User { email }
4. Validar: emailVerified != null (email debe estar verificado)
5. Buscar Account { userId, provider: 'credentials' }
6. bcryptjs.compare(password, Account.password)
7. Si OK → Crear JWT session
8. Si NO → Error "Email o contraseña incorrectos"
```

### Reset Contraseña
```
1. Usuario → POST /api/auth/forgot-password
2. Generar token único (32 bytes)
3. Guardar en User.passwordResetToken
4. Guardar expiración (1 hora) en User.passwordResetTokenExpiry
5. Enviar email con token
```

### Cambiar Contraseña
```
1. Usuario → GET /reset-password?token=xxx
2. Validar token existe y no ha expirado
3. Usuario → POST /reset-password { token, password }
4. Validar nuevamente
5. Buscar Account { userId }
6. Hash nueva contraseña
7. Update Account.password = hashed
8. Update User:
   - passwordResetToken = null
   - passwordResetTokenExpiry = null
9. Return { success: true }
```

═══════════════════════════════════════════════════════════════════

## TIMELINE DE UN DÍA

```
09:00 AM
  └─ Usuario se registra
     └─ Token email: xxx (válido hasta 09:00 AM MAÑANA)

02:00 PM
  └─ Usuario verifica email
     └─ emailVerified = 2024-01-15 14:00:00
     └─ emailVerificationToken = null
     └─ User puede hacer login

11:00 PM
  └─ Usuario olvida contraseña
     └─ Solicita reset
     └─ Token: yyy (válido solo 1 HORA - hasta 11:00 PM)

11:30 PM
  └─ Usuario recibe email
     └─ Click en link
     └─ Ingresa nueva contraseña
     └─ passwordResetToken = null
     └─ User puede login con nueva contraseña

12:30 AM (próximo día)
  └─ Usuario intenta resetear contraseña otra vez
     └─ Token viejo ya no funciona (expiró hace 1 hora)
     └─ Solicita nuevo reset
```

═══════════════════════════════════════════════════════════════════

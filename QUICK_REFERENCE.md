# 📋 QUICK REFERENCE GUIDE

## 🔗 URLs Principales

| URL | Descripción | Status |
|-----|-------------|--------|
| http://localhost:3000 | Home | ✅ |
| http://localhost:3000/login | Login/Registro | ✅ Updated |
| http://localhost:3000/forgot-password | Solicitar Reset | ✨ NEW |
| http://localhost:3000/reset-password?token=... | Cambiar Contraseña | ✨ NEW |
| http://localhost:3000/verify-email?token=... | Confirmar Email | ✨ NEW |
| http://localhost:3000/profile | Mi Perfil | ✅ |

## 📡 API Endpoints

### Autenticación
```
POST /api/auth/register
  Body: { name, email, password }
  Response: { success, user, message }

POST /api/auth/login
  Body: { email, password }
  Response: { success, user }
```

### Email Verification
```
POST /api/auth/verify-email
  Body: { email }
  Response: { success, message }

GET /api/auth/verify-email?token=xxx
  Response: { success, message }
```

### Password Recovery
```
POST /api/auth/forgot-password
  Body: { email }
  Response: { success, message }

GET /api/auth/reset-password?token=xxx
  Response: { success, message }

POST /api/auth/reset-password
  Body: { token, password, confirmPassword }
  Response: { success, message }
```

## 🖥️ Comandos

```bash
# Desarrollo
npm run dev              # Iniciar servidor local (port 3000)
npm run build            # Compilar para producción
npm start                # Correr versión compilada

# Base de Datos
npx prisma generate     # Regenerar Prisma Client
npx prisma db push      # Sincronizar schema con DB
npx prisma studio      # Abrir Prisma Studio UI
npx prisma migrate dev  # Crear migración

# Code Quality
npm run lint            # Verificar linting
npm run format          # Formatear código (si está configurado)

# Testing
npm test                # Correr tests (si están configurados)
```

## 🌍 Environment Variables

### Requeridas
```env
DATABASE_URL=mongodb+srv://...nanPageDatabase
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
EMAIL_USER=your@email.com        # ⚠️ IMPORTANTE
EMAIL_PASSWORD=app-password      # ⚠️ IMPORTANTE
```

### Opcionales
```env
GOOGLE_ID=...
GOOGLE_SECRET=...
FACEBOOK_ID=...
FACEBOOK_SECRET=...
```

## 📁 Estructura de Carpetas Importantes

```
app/api/auth/
  ├── register/         → POST registrar usuario
  ├── login/            → POST validar login
  ├── verify-email/     → GET/POST verificación
  ├── forgot-password/  → POST solicitar reset
  ├── reset-password/   → GET/POST cambiar password
  └── services/         → Funciones compartidas

app/(main)/
  ├── login/            → Página de login/registro
  ├── forgot-password/  → Página solicitar reset
  ├── reset-password/   → Página cambiar password
  └── verify-email/     → Página confirmar email

lib/
  ├── emailService.ts   → Envío de emails
  ├── auth.ts           → Tipos de autenticación
  ├── nextAuth.ts       → Config NextAuth
  └── prisma.ts         → Prisma singleton

prisma/
  └── schema.prisma     → Modelos de base de datos
```

## 🧪 Testing Rápido

### Flujo Completo (5 min)
1. Ir a /login → Regístrate → Completa form
2. Revisa email → Click link de verificación
3. Confirma que dice "¡Éxito!"
4. Login con tu email y contraseña
5. ✅ Éxito

### Flujo Recuperación (5 min)
1. Click "¿Olvidaste?"
2. Ingresa email
3. Revisa email → Click reset link
4. Ingresa nueva contraseña
5. Login con nueva contraseña
6. ✅ Éxito

## 🔐 Información de Seguridad

| Aspecto | Valor | Notas |
|--------|-------|-------|
| Password Hash | bcryptjs 10 rounds | Seguro |
| Email Token | 32 bytes crypto | Único |
| Email Expiry | 24 horas | Suficiente |
| Reset Expiry | 1 hora | Muy seguro |
| Session | JWT | NextAuth |
| HTTPS | Ready | Configurar en prod |

## ⚠️ Errores Comunes

### Error: "Email service error"
```
Solución: Verificar EMAIL_USER y EMAIL_PASSWORD en .env.local
```

### Error: "Token inválido o expirado"
```
Solución: Pedir nuevo email/reset
Email verification: 24 horas
Password reset: 1 hora
```

### Error: "Cannot find module 'nodemailer'"
```
Solución: npm install nodemailer
```

### Error: "TypeScript compilation failed"
```
Solución: npx prisma generate
```

## 📊 Monitoreo

### Ver logs en desarrollo
```bash
# Los logs aparecen en la terminal donde ejecutaste npm run dev
# Busca líneas que digan:
# - "Email enviado a..."
# - "Token generado..."
# - Error messages en rojo
```

### Ver base de datos
```bash
npx prisma studio
# Se abre en http://localhost:5555
```

## 🔧 Configuración de Email (IMPORTANTE)

### Opción 1: Gmail (Recomendado)
```
1. Ir a: https://myaccount.google.com/apppasswords
2. Seleccionar: Mail + Windows Computer
3. Copiar contraseña (16 chars)
4. Poner en .env.local:
   EMAIL_USER=tu@gmail.com
   EMAIL_PASSWORD=...16-chars...
```

### Opción 2: Ethereal (Testing)
```
1. Registrarse: https://ethereal.email
2. Copiar Email y Password
3. Poner en .env.local:
   EMAIL_USER=...
   EMAIL_PASSWORD=...
```

### Opción 3: SendGrid / Mailgun
```
Reemplazar transporter en lib/emailService.ts
Usar API key en lugar de usuario/contraseña
```

## 🚀 Deployment Checklist

- [ ] EMAIL_USER configurado
- [ ] EMAIL_PASSWORD configurado
- [ ] NEXTAUTH_URL apunta a dominio
- [ ] NEXTAUTH_SECRET es fuerte
- [ ] DATABASE_URL apunta a DB prod
- [ ] npm run build completa sin errores
- [ ] Prueba flujo completo en prod
- [ ] HTTPS habilitado
- [ ] Verificar emails se envían
- [ ] Verificar logs en servidor

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Emails no llegan | Email_USER/PASSWORD incorrecto |
| Token expirado | Solicitar nuevo (24h email, 1h reset) |
| No puedo registrar | Email ya existe o error de conexión |
| Build fails | `npx prisma generate` |
| Servidor no inicia | Ver error en terminal |
| Base de datos | Verificar DATABASE_URL |

## 📚 Archivos de Documentación

```
QUICKSTART.md              ⭐ EMPIEZA AQUÍ (2 min)
IMPLEMENTATION_SUMMARY.md   Resumen ejecutivo (5 min)
SETUP_INSTRUCTIONS.md      Guía de setup completa (10 min)
AUTH_SYSTEM_COMPLETE.md    Documentación técnica (20 min)
TESTING_GUIDE.md           Guía de testing manual (20 min)
PROJECT_STRUCTURE.md       Estructura del proyecto
.env.example               Template de variables
```

## ✨ Features Implementadas

| Feature | Status | Notas |
|---------|--------|-------|
| Registro | ✅ | Auto-envía email |
| Login | ✅ | Valida email verificado |
| Verificación Email | ✅ | 24 horas validez |
| Recuperar Contraseña | ✅ | 1 hora validez |
| NextAuth OAuth | ✅ | Google + Facebook |
| Bcryptjs Hashing | ✅ | 10 rounds |
| Token Expiration | ✅ | Automático |
| Email Templates | ✅ | HTML hermoso |
| UI Responsive | ✅ | Mobile-friendly |
| TypeScript | ✅ | Completamente tipado |

---

**Última Actualización:** Hoy
**Sistema Status:** ✅ READY
**Próximo Paso:** Configurar email en .env.local

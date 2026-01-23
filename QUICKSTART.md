# 🚀 Quick Start Guide

## Resumen Rápido

Has implementado un **sistema de autenticación completo** con:
- ✅ Registro + Login con contraseña segura
- ✅ Verificación de email automática (24h tokens)
- ✅ Recuperación de contraseña (1h tokens)
- ✅ UI hermosa y responsive
- ✅ MongoDB + Prisma integrados

## Paso 1: Configuración de Email (REQUERIDO)

Sin esto, **no se enviarán emails**.

### Opción A: Gmail (Recomendado)

1. Abre: https://myaccount.google.com/apppasswords
2. Selecciona "Mail" y "Windows Computer"
3. Copia la contraseña de 16 caracteres
4. Abre `.env.local` y agrega:

```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=contraseña-de-16-caracteres
```

### Opción B: Testing (Desarrollo)

Para testing sin GMail, puedes usar Ethereal:

```env
EMAIL_USER=your-ethereal-email@ethereal.email
EMAIL_PASSWORD=your-ethereal-password
```

Registrate gratis en: https://ethereal.email

## Paso 2: Iniciar el Servidor

```bash
# Instala dependencias (si no lo hiciste)
npm install

# Inicia servidor de desarrollo
npm run dev
```

El servidor estará en: http://localhost:3000

## Paso 3: Prueba el Sistema

### Flujo Completo (5 minutos)

1. **Abre** http://localhost:3000/login
2. **Click** "Regístrate gratis"
3. **Rellena** el formulario:
   - Nombre: Tu nombre
   - Email: tu-email@example.com
   - Contraseña: MiContraseña123
4. **Click** "Crear cuenta"
5. **Revisa email** (inbox/spam)
6. **Click** link de verificación
7. **Confirma** que dice "¡Éxito!"
8. **Login** con tu email y contraseña
9. **Listo** ✅

### Test de Recuperación de Contraseña

1. **Click** "¿Olvidaste?" en login
2. **Ingresa** tu email
3. **Click** "Enviar Instrucciones"
4. **Revisa email** y haz click en reset link
5. **Ingresa** nueva contraseña
6. **Click** "Resetear Contraseña"
7. **Login** con nueva contraseña
8. **Listo** ✅

## Archivos Importantes

### Nuevas Páginas
- `/login` - Login/Registro (ACTUALIZADA)
- `/forgot-password` - Solicitar reset (NUEVA)
- `/reset-password?token=...` - Cambiar contraseña (NUEVA)
- `/verify-email?token=...` - Confirmar email (NUEVA)

### Nuevos Endpoints API
- `POST /api/auth/register` - Registrar (envía email)
- `POST /api/auth/verify-email` - Solicitar verificación
- `GET /api/auth/verify-email?token=...` - Confirmar email
- `POST /api/auth/forgot-password` - Solicitar reset
- `POST /api/auth/reset-password` - Cambiar contraseña

## Variables de Entorno (.env.local)

```env
# BASE DE DATOS
DATABASE_URL="mongodb+srv://username:password@host/nanPageDatabase"

# NEXTAUTH
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# EMAIL (REQUERIDO PARA FUNCIONAMIENTO)
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-app-password"

# OAUTH (Opcional)
GOOGLE_ID="..."
GOOGLE_SECRET="..."
FACEBOOK_ID="..."
FACEBOOK_SECRET="..."
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Inicia servidor local
npm run build                  # Build para producción
npm start                      # Run versión compilada

# Base de Datos
npx prisma generate           # Regenerar tipos
npx prisma db push            # Sincronizar con MongoDB
npx prisma studio             # Abrir Prisma Studio UI

# Linting
npm run lint                   # Verificar código
```

## Troubleshooting

### ❌ Emails no se envían
- ✅ Verificar `EMAIL_USER` y `EMAIL_PASSWORD` en `.env.local`
- ✅ Usar Gmail App Password (no contraseña regular)
- ✅ Revisar carpeta SPAM del email
- ✅ Ver error en consola del navegador

### ❌ Token expirado
- ✅ Email verification: válido 24 horas
- ✅ Password reset: válido 1 hora
- ✅ Solicitar nuevo si expiró

### ❌ Database connection error
- ✅ Verificar `DATABASE_URL` incluye `/nanPageDatabase`
- ✅ Verificar credenciales de MongoDB

### ❌ Errores de compilación
- ✅ Correr: `npx prisma generate`
- ✅ Eliminar carpeta: `.next`
- ✅ Recompilar: `npm run build`

## Seguridad

✅ Contraseñas hasheadas con bcryptjs (10 rounds)
✅ Tokens seguros (32 bytes crypto)
✅ Tokens con expiration automática
✅ SQL injection prevención (Prisma ORM)
✅ HTTPS ready
✅ Environment variables para secretos

## Próximos Pasos

1. **Configurar EMAIL** (obligatorio) ← ¡EMPIEZA AQUÍ!
2. **Iniciar servidor**: `npm run dev`
3. **Probar flujo completo** (5 minutos)
4. **Revisar documentación**: `AUTH_SYSTEM_COMPLETE.md`
5. **Deploy** a producción con email configurado

## Status

✅ **Sistema Completo y Listo**
✅ **Compilado sin errores**
✅ **Servidor ejecutándose**
⏳ **Esperando configuración de EMAIL**

## Documentación Completa

- `AUTH_SYSTEM_COMPLETE.md` - Documentación técnica completa
- `SETUP_INSTRUCTIONS.md` - Instrucciones de setup detalladas
- `TESTING_GUIDE.md` - Guía de testing manual

---

**¿Listo?** Sigue los 3 pasos arriba y estará funcionando en 5 minutos 🚀

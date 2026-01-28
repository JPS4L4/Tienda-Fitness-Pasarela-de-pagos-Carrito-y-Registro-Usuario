# Configuración de OAuth (Google y Facebook)

Los botones de login social ya están habilitados en la página de login/registro. Ahora necesitas configurar las credenciales de Google y Facebook.

## 📋 Estado Actual

✅ **Frontend**: Botones de Google y Facebook habilitados  
✅ **Backend**: Callbacks OAuth configurados en `lib/nextAuth.ts`  
✅ **Base de Datos**: Campo `providerAccountId` agregado al modelo Account  
✅ **Lógica**: Usuarios OAuth se crean/actualizan automáticamente  

⚠️ **Pendiente**: Configurar credenciales de Google y Facebook

---

## 🔐 1. Configurar Google OAuth

### Paso 1: Crear un proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En el menú lateral, ve a **APIs & Services** → **Credentials**

### Paso 2: Configurar la pantalla de consentimiento
1. Click en **OAuth consent screen**
2. Selecciona **External** (para usuarios fuera de tu organización)
3. Completa la información básica:
   - **App name**: Nan Salazar Fitness
   - **User support email**: tu email
   - **Developer contact**: tu email
4. En **Scopes**, agrega:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Guarda y continúa

### Paso 3: Crear credenciales OAuth 2.0
1. Ve a **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
2. Tipo de aplicación: **Web application**
3. **Nombre**: Nan Salazar Web Client
4. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://tu-dominio.com  (cuando despliegues)
   ```
5. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://tu-dominio.com/api/auth/callback/google  (cuando despliegues)
   ```
6. Click en **Create**

### Paso 4: Copiar credenciales
Copia el **Client ID** y **Client Secret** que aparecen.

### Paso 5: Agregar a .env.local
Abre tu archivo `.env.local` y agrega (reemplazando los valores actuales):

```env
GOOGLE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret-aqui
```

---

## 📘 2. Configurar Facebook Login

### Paso 1: Crear una app en Facebook Developers
1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Click en **My Apps** → **Create App**
3. Tipo de app: **Consumer**
4. Completa la información básica:
   - **App Display Name**: Nan Salazar Fitness
   - **App Contact Email**: tu email
5. Click en **Create App**

### Paso 2: Agregar el producto Facebook Login
1. En el dashboard de tu app, busca **Facebook Login**
2. Click en **Set Up**
3. Selecciona **Web**
4. En **Site URL**, ingresa:
   ```
   http://localhost:3000
   ```
5. Guarda

### Paso 3: Configurar Facebook Login
1. En el menú lateral, ve a **Facebook Login** → **Settings**
2. En **Valid OAuth Redirect URIs**, agrega:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://tu-dominio.com/api/auth/callback/facebook  (cuando despliegues)
   ```
3. Guarda los cambios

### Paso 4: Obtener credenciales
1. Ve a **Settings** → **Basic**
2. Copia el **App ID** y **App Secret**
   - Para ver el **App Secret**, necesitas confirmar tu contraseña de Facebook

### Paso 5: Agregar a .env.local
Abre tu archivo `.env.local` y agrega (reemplazando los valores actuales):

```env
FACEBOOK_CLIENT_ID=tu-app-id-de-facebook
FACEBOOK_CLIENT_SECRET=tu-app-secret-de-facebook
```

### Paso 6: Hacer la app pública (cuando estés listo)
Por defecto, la app está en "Development Mode". Para que usuarios reales puedan usarla:
1. Ve a **Settings** → **Basic**
2. Completa toda la información requerida
3. Sube el ícono de la app (1024x1024 px)
4. En la parte superior, cambia el switch de **Development** a **Live**

---

## 🧪 3. Probar el Login Social

### Después de configurar las credenciales:

1. **Reinicia el servidor**:
   ```bash
   npm run dev
   ```

2. **Ve a la página de login**:
   ```
   http://localhost:3000/login
   ```

3. **Prueba los botones**:
   - Click en **Google**: Deberías ver la pantalla de selección de cuenta de Google
   - Click en **Facebook**: Deberías ver la pantalla de login de Facebook

4. **Verifica la base de datos**:
   ```bash
   npx prisma studio
   ```
   - Revisa la tabla `User`: deberías ver el nuevo usuario con email de Google/Facebook
   - Revisa la tabla `Account`: deberías ver una cuenta con `provider = "google"` o `"facebook"`

---

## ⚠️ Problemas Comunes

### Error: "redirect_uri_mismatch" (Google)
**Causa**: La URL de redirección no coincide con las configuradas en Google Cloud Console.  
**Solución**: Verifica que la URL en Google Cloud Console sea **exactamente** `http://localhost:3000/api/auth/callback/google`

### Error: "Invalid OAuth Redirect URI" (Facebook)
**Causa**: La URL de redirección no está en la lista de URIs válidas.  
**Solución**: Verifica que agregaste `http://localhost:3000/api/auth/callback/facebook` en Facebook Login Settings.

### Error: "Client authentication failed" (Google)
**Causa**: El Client Secret es incorrecto o no está en el .env.local.  
**Solución**: Verifica que copiaste correctamente el Client Secret y que reiniciaste el servidor.

### Error: "App Not Set Up"  (Facebook)
**Causa**: La app está en Development Mode y el usuario no es administrador/desarrollador/probador.  
**Solución**: 
- Opción 1: Agrega al usuario como Tester en **Roles** → **Testers**
- Opción 2: Haz la app pública (ver Paso 6 de Facebook)

### El usuario no se crea en la base de datos
**Causa**: Error en el callback `signIn` o en la función `registerOAuthUser`.  
**Solución**: Revisa la consola del servidor para ver los logs. Busca mensajes que empiecen con `[google]` o `[facebook]`.

---

## 🔒 Seguridad en Producción

Cuando despliegues a producción:

1. **Actualiza las URIs autorizadas** en Google y Facebook con tu dominio real
2. **Nunca expongas** tus Client Secrets en el código fuente
3. **Usa variables de entorno** en tu servicio de hosting (Vercel, Netlify, etc.)
4. **Revisa los permisos** que solicitas (solo email y perfil básico)
5. **Habilita 2FA** en tus cuentas de Google Cloud y Facebook Developers

---

## ✅ Checklist Final

Antes de lanzar a producción, verifica:

- [ ] Google OAuth configurado y probado
- [ ] Facebook Login configurado y probado
- [ ] Variables de entorno en .env.local (desarrollo)
- [ ] Variables de entorno en tu servicio de hosting (producción)
- [ ] URIs de redirección actualizadas para producción
- [ ] App de Facebook en modo "Live"
- [ ] Pruebas con usuarios reales
- [ ] Logs de errores monitoreados

---

## 📝 Notas Adicionales

### Permitir linking de cuentas
El sistema está configurado con `allowDangerousEmailAccountLinking: true`, lo que significa que si un usuario:
1. Se registra con email/contraseña: `usuario@example.com`
2. Luego intenta loguearse con Google usando el mismo email: `usuario@example.com`

Se vincularán automáticamente. Esto mejora la experiencia del usuario pero puede ser un riesgo de seguridad si los emails no están verificados.

### Datos que se obtienen
- **Google**: email, nombre, foto de perfil
- **Facebook**: email, nombre, foto de perfil

Estos datos se almacenan en la tabla `User` y se vinculan con una cuenta en la tabla `Account`.

---

¿Necesitas ayuda con la configuración? Revisa los logs del servidor con `npm run dev` y busca mensajes de error específicos.

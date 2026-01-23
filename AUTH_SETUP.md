# Sistema de Autenticación - Guía Completa

## ✅ Estado: Completamente Funcional

Tu sistema de **Login y Register** está completamente implementado y funcionando con MongoDB a través de Prisma.

---

## 📋 Componentes Implementados

### 1. **Base de Datos MongoDB**
- Colecciones creadas:
  - `User` - Información de usuarios (email, nombre, fecha de creación)
  - `Account` - Credenciales de autenticación (email/password hasheada)
  - Índices únicos en emails y slugs para seguridad

### 2. **Modelos Prisma**
- `User` - Entidad principal de usuarios
- `Account` - Almacena contraseñas hasheadas con bcryptjs (10 rounds)

### 3. **Servicios de Autenticación**
Archivo: `app/api/auth/services/prismaAuthService.ts`

Funciones disponibles:
- `validateCredentials(email, password)` - Valida login con hash
- `registerUser(payload)` - Crea usuario nuevo y hash de contraseña
- `getUserById(userId)` - Obtiene datos del usuario
- `updateUser(userId, data)` - Actualiza nombre e imagen
- `getAllUsers()` - Lista todos los usuarios (debug)

### 4. **Endpoints API**

#### POST `/api/auth/register`
```json
Request:
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "miContraseña123"
}

Response (Success):
{
  "success": true,
  "user": {
    "id": "ObjectId",
    "email": "juan@example.com",
    "name": "Juan Pérez"
  }
}

Response (Error):
{
  "success": false,
  "error": "El email ya está registrado"
}
```

#### POST `/api/auth/login`
```json
Request:
{
  "email": "juan@example.com",
  "password": "miContraseña123"
}

Response (Success):
{
  "success": true,
  "user": {
    "id": "ObjectId",
    "email": "juan@example.com",
    "name": "Juan Pérez"
  }
}

Response (Error):
{
  "success": false,
  "error": "Contraseña incorrecta"
}
```

### 5. **Frontend - Página de Login/Register**
Archivo: `app/(main)/login/page.tsx`

Características:
- ✅ Toggle entre Login y Register
- ✅ Validación de formularios
- ✅ Mensajes de éxito y error
- ✅ Redireccionamiento automático
- ✅ Botones de Login con Google y Facebook
- ✅ Animaciones y diseño responsivo

### 6. **Configuración NextAuth**
Archivo: `lib/nextAuth.ts`

Características:
- ✅ CredentialsProvider para email/password
- ✅ GoogleProvider (requiere credenciales)
- ✅ FacebookProvider (requiere credenciales)
- ✅ JWT strategy
- ✅ Callbacks para manejo de sesión
- ✅ Páginas personalizadas

---

## 🚀 Flujo de Autenticación

### Registro
1. Usuario llena formulario en `/login` (modo register)
2. Frontend valida que contraseñas coincidan
3. POST a `/api/auth/register` con {name, email, password}
4. Backend:
   - Verifica que email no exista
   - Hash de contraseña con bcryptjs (10 rounds)
   - Crea User + Account en MongoDB
   - Retorna usuario creado
5. Frontend redirige a modo login

### Login
1. Usuario ingresa email y contraseña en `/login`
2. Frontend usa NextAuth `signIn("credentials", {email, password})`
3. Backend en NextAuth:
   - Llama a `validateCredentials(email, password)`
   - Busca usuario por email
   - Busca Account con provider="credentials"
   - Compara contraseña con `bcrypt.compare()`
   - Si válida, retorna usuario
4. NextAuth crea sesión JWT
5. Frontend redirige a `/profile`

---

## 🔐 Seguridad

- ✅ Contraseñas nunca se guardan en texto plano
- ✅ Hashing con bcryptjs (10 rounds - más seguro)
- ✅ Validación en backend (no confíes en frontend)
- ✅ Índices únicos en emails (evita duplicados)
- ✅ JWT tokens con secreto en .env
- ✅ Sesiones expiran en 30 días

---

## 📝 Tipos TypeScript

```typescript
// types/auth.ts

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    name: string
  }
  error?: string
}
```

---

## 🧪 Cómo Probar

### 1. Iniciar servidor
```bash
npm run dev
```
Servidor estará en `http://localhost:3000`

### 2. Ir a la página de login
```
http://localhost:3000/login
```

### 3. Registrar usuario de prueba
- Nombre: "Test User"
- Email: "test@example.com"
- Contraseña: "Test123456"

### 4. Iniciar sesión
- Email: "test@example.com"
- Contraseña: "Test123456"

### 5. Ver usuario creado (debug)
```
http://localhost:3000/api/auth/debug?action=users
```

---

## 📊 Base de Datos

### Colección User
```json
{
  "_id": ObjectId,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "emailVerified": null,
  "image": null,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Colección Account
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "provider": "credentials",
  "password": "$2a$10$...", // hash bcryptjs
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

---

## ⚙️ Configuración Requerida

### .env (ya está configurado)
```
NEXTAUTH_SECRET=tu-secreto-aleatorio
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=mongodb+srv://...
```

### Google OAuth (opcional)
```
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

### Facebook OAuth (opcional)
```
FACEBOOK_CLIENT_ID=tu-app-id
FACEBOOK_CLIENT_SECRET=tu-app-secret
```

---

## 🐛 Errores Comunes

### Error: "El email ya está registrado"
- El usuario ya existe en la BD
- Usa otro email o recupera contraseña

### Error: "Contraseña incorrecta"
- La contraseña introducida no coincide
- Verifica mayúsculas/minúsculas

### Error: "Usuario no encontrado"
- No existe usuario con ese email
- Registra una nueva cuenta

---

## 🔄 Próximas Mejoras (Opcional)

1. **Recuperación de contraseña**
   - Enviar email con token
   - Página para resetear contraseña

2. **Verificación de email**
   - Enviar email de confirmación
   - Marcar como emailVerified

3. **Two-Factor Authentication (2FA)**
   - Código por SMS o Google Authenticator

4. **Roles y Permisos**
   - Admin, Editor, Usuario
   - Control de acceso por ruta

5. **Integraciones OAuth**
   - Completar Google y Facebook
   - Agregar GitHub, LinkedIn, etc.

---

## 📞 Soporte

Si hay problemas:
1. Revisa el servidor en la terminal (`npm run dev`)
2. Abre DevTools en el navegador (F12)
3. Revisa la consola de Next.js en la terminal
4. Verifica que MongoDB está conectado

¡El sistema está listo para usar! 🎉

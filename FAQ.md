# ❓ FAQ - Preguntas Frecuentes

## ⚙️ Configuración e Instalación

### P: ¿Qué necesito para que funcione?
**R:** Solo necesitas:
1. Node.js v18+ instalado
2. MongoDB conectado (ya está configurado)
3. Configurar EMAIL_USER y EMAIL_PASSWORD en .env.local
4. Ejecutar `npm run dev`

### P: ¿Cómo configuro el email?
**R:** Hay 2 opciones:

**Opción 1: Gmail**
- Abre: https://myaccount.google.com/apppasswords
- Selecciona "Mail" y "Windows Computer"
- Copia la contraseña (16 caracteres)
- En `.env.local` agrega:
```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=contraseña-de-16-caracteres
```

**Opción 2: Ethereal (Testing)**
- Registrate: https://ethereal.email
- Copia email y password
- Agrega a `.env.local`

### P: ¿Puedo usar otro servicio de email?
**R:** Sí, pero necesitas editar `lib/emailService.ts` y cambiar el transporter. Aquí están algunas opciones:
- SendGrid API
- Mailgun
- AWS SES
- Brevo (Sendinblue)

### P: ¿Es seguro guardar la contraseña en .env.local?
**R:** Para desarrollo sí. Para producción:
- Usar variables de entorno del servidor
- No commitar .env.local a git
- Usar GitHub Secrets en CI/CD
- Usar AWS Secrets Manager / Google Cloud Secret Manager

## 🔐 Seguridad

### P: ¿Las contraseñas están protegidas?
**R:** Sí, con bcryptjs (10 rounds). Las contraseñas nunca se guardan en texto plano.

### P: ¿Qué pasa si alguien intercepta el email de verificación?
**R:** El token en el email solo sirve para verificar. No permite cambiar contraseña. Y expira en 24 horas.

### P: ¿Qué pasa si alguien intercepta el email de reset?
**R:** El token solo sirve para cambiar contraseña. Y expira en 1 hora (muy seguro).

### P: ¿Las sesiones están encriptadas?
**R:** Sí, NextAuth usa JWT firmado. Las cookies son httpOnly (no accesibles desde JavaScript).

## 📧 Emails

### P: ¿Por qué no llegan los emails?
**R:** Posibles causas:
1. EMAIL_USER/PASSWORD incorrecto
2. Gmail: usar App Password, no contraseña normal
3. Revisar carpeta SPAM
4. Ver console del navegador para errores

### P: ¿Puedo personalizar el email?
**R:** Sí, edita `lib/emailService.ts` y cambia el HTML en las funciones `sendVerificationEmail()` y `sendPasswordResetEmail()`.

### P: ¿Puedo cambiar el asunto del email?
**R:** Sí, en `lib/emailService.ts` cambia la opción `subject` en el objeto de configuración de nodemailer.

### P: ¿Funciona con emails corporativos?
**R:** Sí, si tienen SMTP configurado. Solo cambia las credenciales del transporter.

## 👤 Usuarios

### P: ¿Cómo cambio la contraseña de un usuario?
**R:** Flujo normal:
1. Click "¿Olvidaste?"
2. Ingresa email
3. Click link del email
4. Ingresa nueva contraseña
5. Listo

### P: ¿Qué pasa si un usuario nunca verifica su email?
**R:** No puede hacer login. La verificación es obligatoria (por seguridad).

### P: ¿Puedo permitir login sin verificar email?
**R:** Sí, pero no es seguro. Edita `validateCredentials()` en `prismaAuthService.ts` y comenta la línea que valida `emailVerified`.

### P: ¿Puedo eliminar un usuario?
**R:** Necesitas agregar endpoint DELETE. No está incluido por seguridad.

### P: ¿Puedo cambiar los datos del usuario?
**R:** Sí, hay función `updateUser()` en `prismaAuthService.ts`. Solo está protegida (validar que sea el mismo usuario).

## 🗄️ Base de Datos

### P: ¿Dónde se guardan los emails?
**R:** En colección `User` de MongoDB, field `email`.

### P: ¿Dónde se guardan las contraseñas?
**R:** Hasheadas en colección `Account`, field `password`.

### P: ¿Dónde se guardan los tokens?
**R:** En colección `User`:
- Email verification: `emailVerificationToken`
- Password reset: `passwordResetToken`

### P: ¿Cómo veo los usuarios?
**R:** Ejecuta:
```bash
npx prisma studio
```
Abre: http://localhost:5555

### P: ¿Puedo hacer backup?
**R:** Sí, MongoDB lo soporta. Contacta a tu proveedor de hosting.

## 🚀 Deployment

### P: ¿Cómo publico a producción?
**R:**
1. `npm run build` (verificar sin errores)
2. Setear variables en servidor:
   - DATABASE_URL (producción)
   - EMAIL_USER
   - EMAIL_PASSWORD
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
3. Deployar (Vercel, Heroku, AWS, etc.)

### P: ¿Qué pasa si no configuro NEXTAUTH_URL?
**R:** Las cookies no se guardan correctamente. Los usuarios no pueden mantener sesión.

### P: ¿HTTPS es necesario?
**R:** En producción sí. Las cookies httpOnly son más seguras con HTTPS.

### P: ¿Funciona con Vercel?
**R:** Sí, es la forma más fácil. Solo configura variables de entorno en dashboard.

### P: ¿Funciona con Heroku?
**R:** Sí, pero Heroku duerme apps gratis. Mejor usar Vercel o Railway.

## 🧪 Testing

### P: ¿Cómo testeo el sistema?
**R:** Sigue TESTING_GUIDE.md:
1. Registrarse
2. Verificar email
3. Login
4. Solicitar reset
5. Cambiar contraseña
6. Login con nueva contraseña

### P: ¿Puedo crear usuarios de prueba?
**R:** Sí, directamente en Prisma Studio o via API.

### P: ¿Hay tests automáticos?
**R:** No, están configurados manualmente. Puedes agregar Jest si quieres.

## 🐛 Troubleshooting

### P: Error "Cannot find module 'nodemailer'"
**R:** Ejecuta:
```bash
npm install nodemailer @types/nodemailer
```

### P: Error "TypeScript compilation failed"
**R:** Ejecuta:
```bash
npx prisma generate
```

### P: El servidor no inicia
**R:** Revisa:
1. DATABASE_URL en .env.local
2. MongoDB está activo
3. Puerto 3000 no está en uso

### P: Emails no se envían
**R:** Revisa:
1. EMAIL_USER correcto
2. EMAIL_PASSWORD correcto (App Password si es Gmail)
3. Revisar SPAM
4. Ver console del navegador para errores

### P: Token inválido/expirado
**R:** Solicita uno nuevo:
- Email: 24 horas
- Password reset: 1 hora

### P: Login no funciona
**R:** Verifica:
1. Email existe
2. Email está verificado
3. Contraseña es correcta
4. Revisar console para errores

### P: Redirect infinito
**R:** Probablemente:
1. NEXTAUTH_URL incorrecto
2. Variables de entorno no se cargan
3. Session no persiste

## 💡 Mejoras Futuro

### P: ¿Puedo agregar 2FA?
**R:** Sí, agregar TOTP u otro método en endpoints de login.

### P: ¿Puedo agregar rate limiting?
**R:** Sí, usar middleware como `express-rate-limit`.

### P: ¿Puedo agregar CAPTCHA?
**R:** Sí, integrar reCAPTCHA v3 en formularios.

### P: ¿Puedo agregar multi-lenguaje?
**R:** Sí, usar i18n-next. También los emails.

### P: ¿Puedo agregar más OAuth?
**R:** Sí, NextAuth soporta +50 proveedores.

## 📚 Documentación

### P: ¿Dónde está toda la documentación?
**R:** Aquí:
- QUICKSTART.md - Empezar (2 min)
- SETUP_INSTRUCTIONS.md - Setup (10 min)
- AUTH_SYSTEM_COMPLETE.md - Documentación técnica (20 min)
- TESTING_GUIDE.md - Testing (20 min)
- AUTHENTICATION_FLOWS.md - Flujos visuales
- QUICK_REFERENCE.md - Referencia rápida
- Este archivo - Preguntas comunes

### P: ¿Hay videos tutoriales?
**R:** No, pero puedes seguir TESTING_GUIDE.md paso a paso.

### P: ¿Hay ejemplos de código?
**R:** Sí, está en AUTH_SYSTEM_COMPLETE.md con ejemplos de requests/responses.

## 🤝 Soporte

### P: ¿Qué hago si tengo un problema no listado?
**R:**
1. Lee QUICKSTART.md
2. Lee SETUP_INSTRUCTIONS.md
3. Revisa console del navegador (F12)
4. Mira logs del servidor
5. Revisa Prisma Studio para estado de DB

### P: ¿Dónde reporte bugs?
**R:** En GitHub issues (si tienes acceso al repo).

### P: ¿Dónde sugiero mejoras?
**R:** En GitHub discussions o contacta directamente.

---

## 🎯 Checklist Rápido si Algo Falla

```
❌ Emails no llegan
  ✅ Verificar EMAIL_USER y EMAIL_PASSWORD en .env.local
  ✅ Para Gmail: usar App Password (no contraseña normal)
  ✅ Revisar SPAM folder
  ✅ Ver browser console (F12) para errores

❌ Token expirado
  ✅ Email verification: válido 24 horas
  ✅ Password reset: válido 1 hora
  ✅ Solicitar nuevo si expiró

❌ Build fails
  ✅ npx prisma generate
  ✅ rm -r .next
  ✅ npm run build

❌ Servidor no inicia
  ✅ Ver puerto 3000 no esté en uso
  ✅ DATABASE_URL en .env.local
  ✅ MongoDB está activo
  ✅ npm install (si faltan dependencias)

❌ Login no funciona
  ✅ Email existe en DB
  ✅ Email está verificado (emailVerified != null)
  ✅ Contraseña es correcta
  ✅ Ver browser console para errores

❌ Otro error
  ✅ Leer mensaje de error completo
  ✅ Buscar en esta FAQ
  ✅ Ver SETUP_INSTRUCTIONS.md
  ✅ Revisar QUICKSTART.md
```

---

**¿No encuentras tu respuesta?** 
Lee los documentos en este orden:
1. QUICKSTART.md (2 min)
2. SETUP_INSTRUCTIONS.md (5 min)
3. AUTH_SYSTEM_COMPLETE.md (15 min)
4. Este FAQ (5 min)

O revisa el código. Está bien comentado 😊

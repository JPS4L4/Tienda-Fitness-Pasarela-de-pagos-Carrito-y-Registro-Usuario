# Configuración de Email con NodeMailer

Este proyecto usa NodeMailer para enviar correos electrónicos en las funcionalidades de:
- 📧 **Formulario de Contacto** (`/contact`)
- 🆘 **Formulario de Soporte** (`/support`)
- ✉️ **Verificación de email** (registro de usuarios)
- 🔐 **Reset de contraseña**

## 🚀 Configuración Rápida (Gmail)

### 1. Obtener App Password de Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Ve a **Seguridad** → **Verificación en 2 pasos** (actívala si no está activada)
3. Ve a **Seguridad** → **Contraseñas de aplicaciones**
4. Crea una nueva contraseña de aplicación:
   - Selecciona "Correo" como aplicación
   - Selecciona "Otro" como dispositivo
   - Nombra: "NanSalazar Website"
5. Copia la contraseña de 16 caracteres generada

### 2. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="la-contraseña-de-app-de-16-caracteres"
EMAIL_FROM="NanSalazar <tu-email@gmail.com>"
```

### 3. ¡Listo!

Reinicia el servidor de desarrollo y prueba los formularios:
- http://localhost:3000/contact
- http://localhost:3000/support

---

## 🔧 Modo Desarrollo (Sin Configuración)

Si **NO** configuras `EMAIL_USER` y `EMAIL_PASSWORD`, el sistema funcionará en modo desarrollo:

- ✅ Los formularios funcionarán sin errores
- 📝 Los emails se loguearán en la consola del servidor
- ❌ NO se enviarán emails reales

Esto es útil para desarrollo local sin necesidad de configurar credenciales.

---

## 🌐 Configuración SMTP Personalizada

Si quieres usar otro servicio de email (no Gmail), configura estas variables:

```env
EMAIL_HOST="smtp.tu-dominio.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="tu-email@tu-dominio.com"
EMAIL_PASSWORD="tu-contraseña"
EMAIL_FROM="Tu Nombre <tu-email@tu-dominio.com>"
```

### Ejemplos de configuración:

**Outlook/Hotmail:**
```env
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
```

**Yahoo:**
```env
EMAIL_HOST="smtp.mail.yahoo.com"
EMAIL_PORT="465"
EMAIL_SECURE="true"
```

**SendGrid:**
```env
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USER="apikey"
EMAIL_PASSWORD="tu-api-key-de-sendgrid"
```

---

## 📬 Tipos de Emails Enviados

### 1. Contacto (`/contact`)
- **Para Admin:** Notificación de nuevo mensaje con datos del remitente
- **Para Usuario:** Confirmación de que el mensaje fue recibido

### 2. Soporte (`/support`)
- **Para Admin:** Ticket de soporte con asunto, mensaje y número de orden (opcional)
- **Para Usuario:** Confirmación de ticket con tiempo estimado de respuesta

### 3. Verificación de Email
- Enviado al registrarse
- Incluye link con token que expira en 24 horas

### 4. Reset de Contraseña
- Enviado al solicitar recuperación
- Incluye link con token que expira en 1 hora

---

## 🎨 Personalización

Los templates de email están en `lib/emailService.ts`. Puedes personalizar:

- 🎨 Colores y estilos
- 📝 Textos y mensajes
- 🔗 URLs y enlaces
- ⏰ Tiempos de expiración de tokens

---

## ❓ Solución de Problemas

### Error: "Invalid login: 535 Authentication failed"
- Verifica que estés usando la **App Password** de Gmail, no tu contraseña regular
- Asegúrate de que la verificación en 2 pasos esté activada

### Los emails no se envían pero no hay errores
- Revisa la consola del servidor, deberías ver logs de los emails
- Verifica que `EMAIL_USER` y `EMAIL_PASSWORD` estén configurados en `.env`
- Reinicia el servidor después de cambiar el `.env`

### Error: "Connection timeout"
- Verifica tu conexión a internet
- Si usas firewall corporativo, puede estar bloqueando el puerto 587/465
- Intenta con `EMAIL_SECURE="true"` y `EMAIL_PORT="465"`

---

## 🔒 Seguridad

- ❌ **NUNCA** subas tu archivo `.env` a Git
- ✅ El archivo `.env.example` ya está configurado como template
- ✅ Las App Passwords son más seguras que contraseñas regulares
- ✅ Considera usar servicios como SendGrid o Mailgun en producción para mejor deliverability

---

## 📚 Recursos

- [NodeMailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)

---

¿Necesitas ayuda? Abre un issue en el repositorio.

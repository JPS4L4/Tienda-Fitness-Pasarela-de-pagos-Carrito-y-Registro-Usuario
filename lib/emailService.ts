import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configurar transporte de email
// En desarrollo, si no hay credenciales, usa un transporte sin validación
let transporter: any;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  // Producción: con Gmail
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
} else if (process.env.EMAIL_HOST) {
  // Desarrollo: con servidor SMTP personalizado
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: process.env.EMAIL_USER && process.env.EMAIL_PASSWORD ? {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    } : undefined,
  });
} else {
  // Modo desarrollo: solo loguea los emails sin enviar
  console.warn('⚠️  EMAIL_USER o EMAIL_PASSWORD no configurados. Los emails se loguearán pero NO se enviarán.');
  transporter = {
    sendMail: async (options: any) => {
      console.log('📧 [EMAIL] De:', options.from);
      console.log('📧 [EMAIL] Para:', options.to);
      console.log('📧 [EMAIL] Asunto:', options.subject);
      return { messageId: 'dev-mock-id' };
    }
  };
}

/**
 * Generar token aleatorio seguro
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calcular fecha de expiración (por defecto 24 horas)
 */
export function getTokenExpiry(hours: number = 24): Date {
  const now = new Date();
  now.setHours(now.getHours() + hours);
  return now;
}

/**
 * Enviar email de verificación
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `NanSalazar <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verifica tu email - NanSalazar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Bienvenido a NanSalazar</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
            <p style="color: #475569; font-size: 16px; margin: 0 0 20px 0;">
              ¡Hola <strong>${name}</strong>!
            </p>
            
            <p style="color: #475569; font-size: 16px; margin: 0 0 30px 0;">
              Gracias por registrarte. Para completar tu cuenta, verifica tu email haciendo click en el botón de abajo.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #14b8a6 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Verificar Email
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; margin: 30px 0 0 0;">
              O copia y pega este enlace en tu navegador:<br/>
              <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px;">${verificationUrl}</code>
            </p>
            
            <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0 0;">
              Este link expira en 24 horas.
            </p>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
            <p style="margin: 0;">© 2026 NanSalazar. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de verificación enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    return false;
  }
}

/**
 * Enviar email de reset de contraseña
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `NanSalazar <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Resetea tu contraseña - NanSalazar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Recuperar Contraseña</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
            <p style="color: #475569; font-size: 16px; margin: 0 0 20px 0;">
              ¡Hola <strong>${name}</strong>!
            </p>
            
            <p style="color: #475569; font-size: 16px; margin: 0 0 30px 0;">
              Recibimos una solicitud para resetear tu contraseña. Si no fuiste tú, ignora este email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #14b8a6 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Resetear Contraseña
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; margin: 30px 0 0 0;">
              O copia y pega este enlace en tu navegador:<br/>
              <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px;">${resetUrl}</code>
            </p>
            
            <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0 0;">
              Este link expira en 1 hora.
            </p>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #991b1b; font-size: 12px; margin: 0;">
                <strong>⚠️ Importante:</strong> Si no solicitaste este cambio, tu cuenta podría estar en riesgo. Cambia tu contraseña inmediatamente.
              </p>
            </div>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
            <p style="margin: 0;">© 2026 NanSalazar. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de reset enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('Error enviando email de reset:', error);
    return false;
  }
}

/**
 * Verificar si el token ha expirado
 */
export function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}

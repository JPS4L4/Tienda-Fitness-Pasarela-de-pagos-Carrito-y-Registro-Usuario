// lib/emailService.ts
import { Resend } from 'resend'
import crypto from 'crypto'

const resendApiKey = process.env.RESEND_API_KEY
const resendEnabled = Boolean(resendApiKey)
const resend = resendEnabled ? new Resend(resendApiKey) : null

if (!resendEnabled) {
  console.warn('⚠️ RESEND_API_KEY no configurada. Los emails se loguearán pero NO se enviarán.')
}

const getFromEmail = () => process.env.EMAIL_FROM || 'onboarding@resend.dev'
const getAdminEmail = (fallback: string) =>
  process.env.EMAIL_ADMIN || process.env.EMAIL_USER || fallback
const getInstructorEmail = (fallback: string) =>
  process.env.EMAIL_INSTRUCTOR || process.env.EMAIL_ADMIN || process.env.EMAIL_USER || fallback

const logEmail = (to: string, subject: string) => {
  console.log('📧 [EMAIL] Para:', to)
  console.log('📧 [EMAIL] Asunto:', subject)
}

/**
 * Generar token aleatorio seguro
 */
export function generateToken(): string {
  return crypto.randomUUID()
}

/**
 * Calcular fecha de expiración (por defecto 1 hora para reset)
 */
export function getTokenExpiry(hours: number = 1): Date {
  const now = new Date()
  now.setHours(now.getHours() + hours)
  return now
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
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

    if (!resend) {
      logEmail(email, 'Verifica tu email - FitnessStudio')
      return false
    }

    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: 'Verifica tu email - FitnessStudio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Bienvenido a FitnessStudio</h1>
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
              O copia y pega este enlace:<br/>
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
    })

    if (error) {
      console.error('Error Resend:', error)
      return false
    }

    console.log(`Email de verificación enviado a ${email}`)
    return true
  } catch (error) {
    console.error('Error enviando email de verificación:', error)
    return false
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
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    if (!resend) {
      logEmail(email, 'Resetea tu contraseña - NanSalazar')
      return false
    }

    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: 'Resetea tu contraseña - FitnessStudio',
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
              O copia y pega este enlace:<br/>
              <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px;">${resetUrl}</code>
            </p>
            
            <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0 0;">
              Este link expira en 1 hora.
            </p>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
            <p style="margin: 0;">© 2026 NanSalazar. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Error Resend:', error)
      return false
    }

    console.log(`Email de reset enviado a ${email}`)
    return true
  } catch (error) {
    console.error('Error enviando email de reset:', error)
    return false
  }
}

/**
 * Verificar si el token ha expirado
 */
export function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true
  return new Date() > expiryDate
}

/**
 * Enviar email de contacto
 */
export async function sendContactEmail(
  name: string,
  lastName: string,
  email: string,
  message: string
): Promise<boolean> {
  try {
    const adminEmail = getAdminEmail('admin@nansalazar.com');

    if (!resend) {
      logEmail(adminEmail, `Nuevo mensaje de contacto - ${name} ${lastName}`)
      logEmail(email, 'Recibimos tu mensaje - NanSalazar')
      return false
    }
    
    // Email para el admin
    const mailOptionsAdmin = {
      from: getFromEmail(),
      to: adminEmail,
      replyTo: email,
      subject: `Nuevo mensaje de contacto - ${name} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Nuevo Mensaje de Contacto</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">NOMBRE COMPLETO</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: bold; margin: 0;">${name} ${lastName}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">EMAIL</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: bold; margin: 0;">
                <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">MENSAJE</p>
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
            <p style="margin: 0;">© 2026 NanSalazar. Sistema de Contacto.</p>
          </div>
        </div>
      `,
    };

    // Email de confirmación para el usuario
    const mailOptionsUser = {
      from: getFromEmail(),
      to: email,
      subject: 'Recibimos tu mensaje - FitnessStudio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Mensaje Recibido</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
            <p style="color: #475569; font-size: 16px; margin: 0 0 20px 0;">
              ¡Hola <strong>${name}</strong>!
            </p>
            
            <p style="color: #475569; font-size: 16px; margin: 0 0 30px 0;">
              Hemos recibido tu mensaje y nuestro equipo lo revisará pronto. Te responderemos en menos de 24 horas.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #14b8a6;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">TU MENSAJE:</p>
              <p style="color: #1e293b; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; margin: 30px 0 0 0;">
              Gracias por contactarnos. Estamos aquí para ayudarte.
            </p>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
            <p style="margin: 0;">© 2026 NanSalazar. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    };

    const [adminResult, userResult] = await Promise.all([
      resend.emails.send(mailOptionsAdmin),
      resend.emails.send(mailOptionsUser),
    ])

    if (adminResult.error || userResult.error) {
      console.error('Error Resend (contacto):', adminResult.error || userResult.error)
      return false
    }
    console.log(`Email de contacto enviado desde ${email}`);
    return true;
  } catch (error) {
    console.error('Error enviando email de contacto:', error);
    return false;
  }
}

/**
 * Enviar email de soporte
 */
export async function sendSupportEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
  orderNumber?: string
): Promise<boolean> {
  try {
    const adminEmail = getAdminEmail('soporte@fitnessStudio.com');

    if (!resend) {
      logEmail(adminEmail, `[SOPORTE] ${subject}`)
      logEmail(email, `Ticket de soporte recibido: ${subject}`)
      return false
    }
    
    // Email para el admin/soporte
    const mailOptionsAdmin = {
      from: getFromEmail(),
      to: adminEmail,
      replyTo: email,
      subject: `[SOPORTE] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🆘 Ticket de Soporte</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
              <p style="color: #991b1b; font-size: 14px; font-weight: bold; margin: 0;">
                ASUNTO: ${subject}
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">USUARIO</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: bold; margin: 0;">${name}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">EMAIL</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: bold; margin: 0;">
                <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
              </p>
            </div>
            
            ${orderNumber ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">NÚMERO DE ORDEN</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: bold; margin: 0;">${orderNumber}</p>
            </div>
            ` : ''}
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">DESCRIPCIÓN DEL PROBLEMA</p>
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
            <p style="margin: 0;">© 2026 NanSalazar. Sistema de Soporte.</p>
          </div>
        </div>
      `,
    };

    // Email de confirmación para el usuario
    const mailOptionsUser = {
      from: getFromEmail(),
      to: email,
      subject: `Ticket de soporte recibido: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Ticket Recibido</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
            <p style="color: #475569; font-size: 16px; margin: 0 0 20px 0;">
              ¡Hola <strong>${name}</strong>!
            </p>
            
            <p style="color: #475569; font-size: 16px; margin: 0 0 30px 0;">
              Hemos recibido tu solicitud de soporte. Nuestro equipo técnico la está revisando y te responderemos lo antes posible.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #14b8a6; margin-bottom: 20px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">ASUNTO</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">${subject}</p>
              
              ${orderNumber ? `
              <p style="color: #64748b; font-size: 12px; margin: 15px 0 5px 0;">ORDEN</p>
              <p style="color: #1e293b; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">${orderNumber}</p>
              ` : ''}
              
              <p style="color: #64748b; font-size: 12px; margin: 15px 0 5px 0;">MENSAJE</p>
              <p style="color: #1e293b; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 8px;">
              <p style="color: #065f46; font-size: 14px; margin: 0;">
                ✅ <strong>Tiempo estimado de respuesta:</strong> 24-48 horas
              </p>
            </div>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
            <p style="margin: 0;">© 2026 NanSalazar. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    };

    const [adminResult, userResult] = await Promise.all([
      resend.emails.send(mailOptionsAdmin),
      resend.emails.send(mailOptionsUser),
    ])

    if (adminResult.error || userResult.error) {
      console.error('Error Resend (soporte):', adminResult.error || userResult.error)
      return false
    }
    console.log(`Email de soporte enviado desde ${email}`);
    return true;
  } catch (error) {
    console.error('Error enviando email de soporte:', error);
    return false;
  }
}

/**
 * Enviar email al instructor con el perfil fitness del usuario
 */
export async function sendPlanInstructorEmail(params: {
  userName: string | null;
  userEmail: string | null;
  planTitle: string;
  fitnessProfileData: Record<string, unknown> | null;
}): Promise<boolean> {
  try {
    const instructorEmail = getInstructorEmail('instructor@nansalazar.com');
    const resolvedUserName = params.userName || 'Usuario';
    const resolvedUserEmail = params.userEmail || 'sin-email';
    const profileJson = JSON.stringify(params.fitnessProfileData ?? {}, null, 2);

    if (!resend) {
      logEmail(instructorEmail, `Nuevo plan solicitado - ${params.planTitle}`);
      return false;
    }

    const mailOptionsInstructor = {
      from: getFromEmail(),
      to: instructorEmail,
      subject: `Nuevo plan solicitado - ${params.planTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Solicitud de Plan</h1>
          </div>
          <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">USUARIO</p>
              <p style="color: #0f172a; font-size: 16px; font-weight: bold; margin: 0;">${resolvedUserName}</p>
            </div>
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">EMAIL</p>
              <p style="color: #0f172a; font-size: 16px; font-weight: bold; margin: 0;">${resolvedUserEmail}</p>
            </div>
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">PLAN</p>
              <p style="color: #0f172a; font-size: 16px; font-weight: bold; margin: 0;">${params.planTitle}</p>
            </div>
            <div style="background: #0f172a; padding: 16px; border-radius: 8px;">
              <p style="color: #93c5fd; font-size: 12px; margin: 0 0 8px 0;">PERFIL FITNESS (JSON)</p>
              <pre style="color: #e2e8f0; font-size: 12px; margin: 0; white-space: pre-wrap;">${profileJson}</pre>
            </div>
          </div>
        </div>
      `,
    };

    const { error } = await resend.emails.send(mailOptionsInstructor);
    if (error) {
      console.error('Error Resend (plan instructor):', error);
      return false;
    }

    console.log(`Email de plan enviado a instructor: ${instructorEmail}`);
    return true;
  } catch (error) {
    console.error('Error enviando email al instructor:', error);
    return false;
  }
}

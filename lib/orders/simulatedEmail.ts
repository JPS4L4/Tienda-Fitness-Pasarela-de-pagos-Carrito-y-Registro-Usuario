// lib/orders/simulatedEmail.ts
// Correos "que se habrían enviado" en modo demo. Nunca se llama a Resend: el contenido se construye a
// partir de la orden (sin guardar nada) y se muestra en pantalla.
import { BRAND_CONTACT_EMAIL, BRAND_NAME } from '@/lib/brand'
import { formatPrice } from '@/lib/money'

export type SimulatedEmail = {
  kind: 'customer-confirmation' | 'instructor-notice'
  to: string
  from: string
  subject: string
  body: string
}

export type EmailOrder = {
  id: number
  planId: number | null
  customerEmail: string
  customerFirstName: string | null
  totalAmount: number
  items: unknown
  shippingAddress?: string | null
  shippingCity?: string | null
  trackingNumber?: string | null
}

type EmailLine = { title?: string; quantity?: number; price?: number; unit_price?: number; type?: string }

const FROM = `${BRAND_NAME} <pedidos@demo.invalid>`
const DEMO_NOTE = '(Correo simulado: la tienda está en modo demo y no envía correos reales.)'

const linesOf = (items: unknown): EmailLine[] =>
  Array.isArray(items) ? (items as EmailLine[]).filter(Boolean) : []

export function buildCustomerConfirmationEmail(order: EmailOrder): SimulatedEmail {
  const detail = linesOf(order.items)
    .map((line) => {
      const qty = line.quantity && line.quantity > 1 ? ` x${line.quantity}` : ''
      return `  - ${line.title || 'Producto'}${qty}: ${formatPrice(line.unit_price ?? line.price)}`
    })
    .join('\n')

  const delivery = order.planId
    ? 'Tu plan ya está activo: entra a tu perfil para ver tu acceso.'
    : [
        order.shippingAddress
          ? `Enviaremos tu pedido a: ${order.shippingAddress}${order.shippingCity ? `, ${order.shippingCity}` : ''}.`
          : null,
        order.trackingNumber ? `Guía de seguimiento: ${order.trackingNumber}` : null,
      ]
        .filter(Boolean)
        .join('\n')

  const sections = [
    `Hola ${order.customerFirstName || 'cliente'},`,
    `Recibimos tu pago y confirmamos el pedido #${order.id}.`,
    detail,
    `Total pagado: ${formatPrice(order.totalAmount)}`,
    delivery,
    `Gracias por entrenar con ${BRAND_NAME}.`,
    DEMO_NOTE,
  ].filter(Boolean)

  return {
    kind: 'customer-confirmation',
    to: order.customerEmail,
    from: FROM,
    subject: `Pedido #${order.id} confirmado - ${BRAND_NAME}`,
    body: sections.join('\n\n'),
  }
}

export function buildInstructorNotice(order: EmailOrder): SimulatedEmail {
  const plan = linesOf(order.items).find((line) => line.type === 'plan')
  const title = plan?.title || 'Plan'
  return {
    kind: 'instructor-notice',
    to: process.env.EMAIL_INSTRUCTOR || BRAND_CONTACT_EMAIL,
    from: FROM,
    subject: `Nuevo plan solicitado - ${title}`,
    body: [
      `Un cliente (${order.customerEmail}) compró el plan "${title}" en el pedido #${order.id}.`,
      'Revisa su perfil fitness en el panel de administración.',
      DEMO_NOTE,
    ].join('\n\n'),
  }
}

/** Correos de una orden pagada: confirmación al cliente (+ aviso al instructor si es un plan). */
export function buildOrderEmails(order: EmailOrder): SimulatedEmail[] {
  const emails = [buildCustomerConfirmationEmail(order)]
  if (order.planId) emails.push(buildInstructorNotice(order))
  return emails
}

import { NextResponse } from 'next/server'
import { sendSupportEmail } from '@/lib/emailService'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const name = form.get('name')?.toString() ?? ''
    const email = form.get('email')?.toString() ?? ''
    const subject = form.get('subject')?.toString() ?? ''
    const order = form.get('order')?.toString() ?? ''
    const message = form.get('message')?.toString() ?? ''

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ ok: false, message: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, message: 'Email inválido' },
        { status: 400 }
      );
    }

    const images: Array<{ name: string; size: number; type: string }> = []
    // form.getAll is available for multiple files named 'images'
    try {
      const all = form.getAll('images')
      for (const file of all) {
        // In Next's runtime a file will be a File object
        // We'll only collect metadata here (no persistent storage)
        // @ts-ignore
        if (file && typeof file === 'object' && 'name' in file) {
          // @ts-ignore
          images.push({ name: file.name, size: file.size, type: file.type })
        }
      }
    } catch (e) {
      // ignore if no files
    }

    // Enviar email de soporte
    const emailSent = await sendSupportEmail(
      name, 
      email, 
      subject, 
      message, 
      order || undefined
    );

    if (!emailSent) {
      return NextResponse.json(
        { ok: false, message: 'Error al enviar el ticket de soporte. Por favor intenta de nuevo.' },
        { status: 500 }
      );
    }

    const payload = { name, email, subject, order, message, images }

    return NextResponse.json({ 
      ok: true, 
      message: 'Ticket de soporte enviado correctamente. Te responderemos pronto.', 
      data: payload 
    })
  } catch (err: any) {
    console.error('Error en /api/support:', err);
    return NextResponse.json({ ok: false, message: err?.message || 'Error interno' }, { status: 500 })
  }
}

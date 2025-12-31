import { NextResponse } from 'next/server'

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

    // If you want to integrate real email sending, add SMTP config and a mailer here.
    // For now we simulate the send and return the received payload metadata.

    const payload = { name, email, subject, order, message, images }

    // TODO: integrate nodemailer or an email service with SMTP/API keys

    return NextResponse.json({ ok: true, message: 'Correo recibido (simulado)', data: payload })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Error interno' }, { status: 500 })
  }
}

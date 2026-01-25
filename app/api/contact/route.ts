import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/emailService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, lastName, email, message } = body;

    // Validaciones
    if (!name || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Enviar email
    const emailSent = await sendContactEmail(name, lastName, email, message);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Error al enviar el mensaje. Por favor intenta de nuevo.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Mensaje enviado correctamente. Te responderemos pronto.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en /api/contact:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

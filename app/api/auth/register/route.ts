// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "../services/prismaAuthService"
import { sendVerificationEmail, generateToken, getTokenExpiry } from "@/lib/emailService"
import { prisma } from "@/lib/prisma"
import type { RegisterPayload } from "@/types/auth"
import { registerLimiter, applyRateLimit } from "@/lib/rateLimit"
import { validateRegisterForm, sanitizeInput, detectSQLInjection, detectXSS } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Iniciando registro...")
    
    // Aplicar rate limiting
    const rateLimitResult = await applyRateLimit(request, registerLimiter, 'register');
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }
    
    let body: RegisterPayload

    try {
      body = await request.json()
    } catch (parseError) {
      console.error("❌ Error parseando JSON:", parseError)
      return NextResponse.json(
        { success: false, message: "JSON inválido en la solicitud" },
        { status: 400 }
      )
    }

    const { name, email, password, phone } = body

    // Validar que todos los campos estén presentes
    if (!name || !email || !password) {
      console.log("❌ Faltan campos:", { name: !!name, email: !!email, password: !!password })
      return NextResponse.json(
        { success: false, message: "Faltan campos requeridos (name, email, password)" },
        { status: 400 }
      )
    }

    // Sanitizar inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPassword = password; // No sanitizar password para preservar caracteres especiales
    const sanitizedPhone = phone ? sanitizeInput(phone) : undefined;
    const normalizedPhone = sanitizedPhone ? sanitizedPhone.replace(/[\s-]/g, "") : undefined;

    // Detectar intentos de SQL Injection o XSS
    if (detectSQLInjection(sanitizedName) || detectSQLInjection(sanitizedEmail) || (normalizedPhone && detectSQLInjection(normalizedPhone))) {
      console.log("⚠️ Intento de SQL Injection detectado");
      return NextResponse.json(
        { success: false, message: "Entrada sospechosa detectada" },
        { status: 400 }
      );
    }

    if (detectXSS(sanitizedName) || detectXSS(sanitizedEmail) || (normalizedPhone && detectXSS(normalizedPhone))) {
      console.log("⚠️ Intento de XSS detectado");
      return NextResponse.json(
        { success: false, message: "Entrada sospechosa detectada" },
        { status: 400 }
      );
    }

    // Validaciones completas con la función de validación
    const validation = validateRegisterForm(sanitizedName, sanitizedEmail, sanitizedPassword, sanitizedPassword, normalizedPhone);
    if (!validation.valid) {
      console.log("❌ Validación fallida:", validation.error);
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    console.log("✅ Validaciones iniciales pasadas para:", sanitizedEmail)

    // Registrar usuario en PostgreSQL con datos sanitizados
    console.log("📝 Llamando a registerUser...")
    const result = await registerUser({ 
      name: sanitizedName, 
      email: sanitizedEmail, 
      password: sanitizedPassword,
      phone: normalizedPhone,
    })

    if (!result.success) {
      console.log("❌ Error en registerUser:", result.error)
      return NextResponse.json(
        { success: false, error: result.error || "Error desconocido al registrar" },
        { status: 400 }
      )
    }

    console.log("✅ Usuario registrado:", result.user?.id)

    // Generar token de verificación de email
    console.log("📧 Generando token de verificación...")
    const verificationToken = generateToken()
    const tokenExpiry = getTokenExpiry(24) // 24 horas

    // Guardar token en la base de datos
    try {
      const updated = await prisma.user.update({
        where: { email: sanitizedEmail },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationTokenExpiry: tokenExpiry,
        },
      })
      console.log("✅ Token guardado para:", updated.id)

      // Enviar email de verificación
      try {
        console.log("📧 Enviando email de verificación...")
        await sendVerificationEmail(sanitizedEmail, sanitizedName, verificationToken)
        console.log("✅ Email de verificación enviado a:", sanitizedEmail)
      } catch (emailError) {
        console.error("⚠️  Error enviando email de verificación:", emailError)
        // No fallar el registro si el email no se envía, solo loguear el error
      }
    } catch (tokenError) {
      console.error("⚠️  Error actualizando usuario con token:", tokenError)
      // No fallar el registro si hay error con el token, solo loguear
    }

    // Respuesta exitosa
    console.log("✅ Registro completado exitosamente para:", sanitizedEmail)
    return NextResponse.json(
      {
        success: true,
        user: result.user,
        message: "Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Error en registro:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Error interno del servidor",
        error: errorMessage 
      },
      { status: 500 }
    )
  }
}

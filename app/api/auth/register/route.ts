// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "../services/prismaAuthService"
import { sendVerificationEmail, generateToken, getTokenExpiry } from "@/lib/emailService"
import { prisma } from "@/lib/prisma"
import type { RegisterPayload } from "@/types/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Iniciando registro...")
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

    const { name, email, password } = body

    // Validar que todos los campos estén presentes
    if (!name || !email || !password) {
      console.log("❌ Faltan campos:", { name: !!name, email: !!email, password: !!password })
      return NextResponse.json(
        { success: false, message: "Faltan campos requeridos (name, email, password)" },
        { status: 400 }
      )
    }

    // Validaciones básicas
    if (email.length < 5 || !email.includes("@")) {
      console.log("❌ Email inválido:", email)
      return NextResponse.json(
        { success: false, message: "Email inválido" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log("❌ Contraseña muy corta")
      return NextResponse.json(
        { success: false, message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    console.log("✅ Validaciones iniciales pasadas para:", email)

    // Registrar usuario en PostgreSQL
    console.log("📝 Llamando a registerUser...")
    const result = await registerUser({ name, email, password })

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
        where: { email },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationTokenExpiry: tokenExpiry,
        },
      })
      console.log("✅ Token guardado para:", updated.id)

      // Enviar email de verificación
      try {
        console.log("📧 Enviando email de verificación...")
        await sendVerificationEmail(email, name, verificationToken)
        console.log("✅ Email de verificación enviado a:", email)
      } catch (emailError) {
        console.error("⚠️  Error enviando email de verificación:", emailError)
        // No fallar el registro si el email no se envía, solo loguear el error
      }
    } catch (tokenError) {
      console.error("⚠️  Error actualizando usuario con token:", tokenError)
      // No fallar el registro si hay error con el token, solo loguear
    }

    // Respuesta exitosa
    console.log("✅ Registro completado exitosamente para:", email)
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

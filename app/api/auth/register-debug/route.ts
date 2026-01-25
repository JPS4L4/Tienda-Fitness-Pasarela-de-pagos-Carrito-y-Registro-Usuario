// app/api/auth/register-debug/route.ts
// Endpoint de debug para ver exactamente qué está pasando en el registro
import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "../services/prismaAuthService"
import { sendVerificationEmail, generateToken, getTokenExpiry } from "@/lib/emailService"
import { prisma } from "@/lib/prisma"
import type { RegisterPayload } from "@/types/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [DEBUG] Iniciando registro...")
    const body: RegisterPayload = await request.json()
    console.log("🔍 [DEBUG] Body recibido:", { ...body, password: "***" })

    const { name, email, password } = body

    // Validar que todos los campos estén presentes
    if (!name || !email || !password) {
      console.log("🔍 [DEBUG] Faltan campos")
      return NextResponse.json(
        { success: false, message: "Faltan campos requeridos (name, email, password)" },
        { status: 400 }
      )
    }

    console.log("🔍 [DEBUG] Validaciones iniciales pasadas")

    // Registrar usuario en PostgreSQL
    console.log("🔍 [DEBUG] Llamando a registerUser...")
    const result = await registerUser({ name, email, password })
    console.log("🔍 [DEBUG] Resultado de registerUser:", result)

    if (!result.success) {
      console.log("🔍 [DEBUG] Error en registerUser:", result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    console.log("🔍 [DEBUG] Usuario registrado exitosamente, generando token...")

    // Generar token de verificación de email
    const verificationToken = generateToken()
    const tokenExpiry = getTokenExpiry(24) // 24 horas

    console.log("🔍 [DEBUG] Token generado, actualizando usuario...")

    // Guardar token en la base de datos
    try {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationTokenExpiry: tokenExpiry,
        },
      })
      console.log("🔍 [DEBUG] Usuario actualizado con token:", updatedUser.id)

      // Enviar email de verificación
      try {
        console.log("🔍 [DEBUG] Intentando enviar email...")
        const emailResult = await sendVerificationEmail(email, name, verificationToken)
        console.log("🔍 [DEBUG] Email enviado:", emailResult)
      } catch (emailError) {
        console.error("🔍 [DEBUG] Error enviando email de verificación:", emailError)
        // No fallar el registro si el email no se envía, solo loguear el error
      }
    } catch (tokenError) {
      console.error("🔍 [DEBUG] Error actualizando usuario con token:", tokenError)
      // No fallar el registro si hay error con el token, solo loguear
    }

    // Respuesta exitosa
    console.log("🔍 [DEBUG] Registro completado exitosamente")
    return NextResponse.json(
      {
        success: true,
        user: result.user,
        message: "Cuenta creada. Revisa tu email para verificar tu cuenta.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("🔍 [DEBUG] Error en registro:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Error interno del servidor",
        debug: errorMessage 
      },
      { status: 500 }
    )
  }
}

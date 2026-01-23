// app/api/auth/debug/route.ts
// Este archivo es SOLO para desarrollo - NO usar en producción

import { NextRequest, NextResponse } from "next/server"
import { getAllUsers } from "../services/prismaAuthService"

/**
 * GET /api/auth/debug
 * 
 * SOLO PARA DESARROLLO - Endpoints de debug para testing
 * 
 * Operaciones disponibles:
 * - ?action=users → Ver todos los usuarios
 * - ?action=clear → Limpiar base de datos (PELIGROSO)
 */

export async function GET(request: NextRequest) {
  // ADVERTENCIA: Solo en desarrollo
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Solo disponible en desarrollo" },
      { status: 403 }
    )
  }

  const action = request.nextUrl.searchParams.get("action")

  switch (action) {
    case "users":
      return await handleGetUsers()
    case "clear":
      // No hay función de limpiar base de datos en prismaAuthService
      return NextResponse.json({ error: "No implementado con Prisma" }, { status: 501 })
    default:
      return handleInfo()
  }
}

async function handleInfo() {
  return NextResponse.json({
    message: "API de Debug (Solo desarrollo)",
    endpoints: {
      users: "/api/auth/debug?action=users",
      clear: "/api/auth/debug?action=clear",
    },
    info: "Usa solo en desarrollo. Estos endpoints no existen en producción.",
  })
}

async function handleGetUsers() {
  const users = await getAllUsers()
  return NextResponse.json({
    success: true,
    count: users.length,
    users: users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
    })),
  })
}

// function handleClearDatabase() {
//   clearDatabase()
//   return NextResponse.json({
//     success: true,
//     message: "Base de datos limpiada. Todos los usuarios fueron eliminados.",
//     warning: "Esta acción no se puede deshacer.",
//   })
// }

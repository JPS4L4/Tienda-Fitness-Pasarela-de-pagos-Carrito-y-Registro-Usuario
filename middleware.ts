// middleware.ts
import { NextRequest, NextResponse } from "next/server"

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  "/",
  "/login",
  "/products",
  "/plans",
  "/contact",
  "/support",
  "/privacidad",
  "/terminos",
]

// Rutas que requieren autenticación
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/purchase",
  "/admin",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Excluir rutas de API de autenticación
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Verificar si hay token de sesión en las cookies
  const token = request.cookies.get("next-auth.session-token")?.value || 
                request.cookies.get("__Secure-next-auth.session-token")?.value

  // Si la ruta es protegida y no hay token, redirigir a login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Continuar normalmente (permitir acceso a login siempre)
  return NextResponse.next()
}

// Configurar qué rutas usan el middleware
export const config = {
  matcher: [
    /*
     * Aplicar middleware a:
     * - rutas API privadas
     * - rutas protegidas
     * Excluir:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.webp|.*\\.png|.*\\.jpg).*)",
  ],
}

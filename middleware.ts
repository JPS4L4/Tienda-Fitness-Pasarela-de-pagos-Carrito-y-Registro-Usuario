// middleware.ts
import { NextRequest, NextResponse } from "next/server"

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  "/",
  "/login",
  "/items",
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

  // Continuar con la respuesta
  const response = NextResponse.next()

  // Agregar headers de seguridad HTTP
  const securityHeaders = {
    // Prevenir clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevenir MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Habilitar protección XSS del navegador
    'X-XSS-Protection': '1; mode=block',
    
    // Política de referrer (no enviar información sensible)
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Política de permisos (Feature Policy)
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    
    // Content Security Policy (CSP) - Ajustar según necesidades
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob: https://q.stripe.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://accounts.google.com https://api.stripe.com https://m.stripe.com https://r.stripe.com",
      "frame-src 'self' https://accounts.google.com https://js.stripe.com https://hooks.stripe.com https://m.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
    
    // Forzar HTTPS en producción (HSTS)
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    })
  };

  // Aplicar headers de seguridad
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response
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

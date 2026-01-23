// app/api/auth/[...nextauth]/route.ts
/**
 * Ruta dinámica de NextAuth para manejar todas las solicitudes de autenticación
 * /api/auth/* es automáticamente manejado por NextAuth
 */

console.log("🔐 NextAuth route.ts being imported");

export { GET, POST } from "@/lib/nextAuth";
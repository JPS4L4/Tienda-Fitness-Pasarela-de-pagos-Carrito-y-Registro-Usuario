import NextAuth, { type NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { validateCredentials } from "@/lib/authService"

export const authOptions: NextAuthOptions = {
  // Proveedores de autenticación
  providers: [
    // Google (opcional, pero muy útil para empezar rápido)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Facebook (opcional)
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Login manual con email + contraseña
    CredentialsProvider({
      name: "Correo y Contraseña",
      credentials: {
        email: { label: "Correo electrónico", type: "email", placeholder: "tu@correo.com" },
        password: { label: "Contraseña", type: "password" }
      },
      // Esta función se ejecuta cuando alguien intenta loguearse con credenciales
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Validar contra PostgreSQL usando Prisma
        const result = await validateCredentials(credentials.email, credentials.password)
        
        if (result.success && result.user && result.user.email) {
          return {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name || "",
          } as any
        }
        
        return null
      },
    }),
  ],

  // Páginas personalizadas
  pages: {
    signIn: "/login",     // tu página de login personalizada
    error: "/login",      // redirige a login en caso de error
    newUser: "/welcome",  // opcional: después del primer login
  },

  // Cómo manejar la sesión
  session: {
    strategy: "jwt" as const,      // JWT es simple
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  // Secreto obligatorio (viene de .env)
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Callback jwt: se ejecuta cuando se crea o actualiza el token
    async jwt({ token, user, account }: any) {
      // user solo existe la primera vez (cuando se autentica)
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      
      // Para OAuth (Google, Facebook)
      if (account?.provider === "google" || account?.provider === "facebook") {
        token.provider = account.provider
      }
      
      return token
    },

    // Callback session: lo que ve el frontend en useSession()
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },

    // Callback sign-in: se ejecuta cuando alguien intenta iniciar sesión
    async signIn({ user, account }: any) {
      // Para OAuth (Google, Facebook), verificar o crear usuario en BD
      if (account?.provider === "google" || account?.provider === "facebook") {
        console.log(`[${account.provider}] Login:`, user.email)
        // Aquí podrías crear el usuario si no existe
      }
      
      return true // Permitir login
    },

    // Callback redirect: después de login exitoso
    async redirect({ url, baseUrl }: any) {
      // Redirige a "/" si no hay callback URL
      if (url.startsWith("/")) return `${baseUrl}${url}`
      return baseUrl
    },
  },

  // Opcional: debug en desarrollo
  debug: process.env.NODE_ENV === "development",
}

// NextAuth handler - este es el que se exporta como GET/POST
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Para usar auth() en servidor/middleware
export function auth(req?: any, res?: any) {
  return getServerSession(authOptions)
}

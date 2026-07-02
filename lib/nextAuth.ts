import NextAuth, { type NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { validateCredentials, registerOAuthUser } from "@/lib/authService"
import { validateLoginForm, sanitizeInput } from "@/lib/validation"
import { prisma } from "@/lib/prisma"

const nextAuthSecret = process.env.NEXTAUTH_SECRET || "change-me-in-vercel"

const providers = [
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
    ? [
        FacebookProvider({
          clientId: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  CredentialsProvider({
      name: "Correo y Contraseña",
      credentials: {
        email: { label: "Correo o teléfono", type: "text", placeholder: "tu@correo.com / +57 300 123 4567" },
        password: { label: "Contraseña", type: "password" }
      },
      // Esta función se ejecuta cuando alguien intenta loguearse con credenciales
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Sanitizar y validar inputs
        const sanitizedIdentifier = sanitizeInput(credentials.email);
        const isEmail = sanitizedIdentifier.includes("@");
        const normalizedIdentifier = isEmail
          ? sanitizedIdentifier.toLowerCase()
          : sanitizedIdentifier.replace(/[\s-]/g, "");
        const sanitizedPassword = credentials.password;

        // Validar formato y detectar ataques
        const validation = validateLoginForm(normalizedIdentifier, sanitizedPassword);
        if (!validation.valid) {
          console.log("❌ Validación fallida en login:", validation.error);
          return null;
        }

        // Validar contra PostgreSQL usando Prisma
        const result = await validateCredentials(normalizedIdentifier, sanitizedPassword)
        
        if (result.success && result.user && result.user.email) {
          return {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name || "",
            phone: result.user.phone || null,
          } as any
        }
        
        return null
      },
    }),
]

export const authOptions: NextAuthOptions = {
  // Proveedores de autenticación
  providers,

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

  // Secreto obligatorio (viene de .env o Vercel)
  secret: nextAuthSecret,

  callbacks: {
    // Callback jwt: se ejecuta cuando se crea o actualiza el token
    async jwt({ token, user, account }: any) {
      // user solo existe la primera vez (cuando se autentica)
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.phone = user.phone
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
        session.user.phone = token.phone as string | undefined

        if (session.user.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: Number(session.user.id) },
            select: { phone: true },
          });
          if (dbUser?.phone) {
            session.user.phone = dbUser.phone;
          }
        }
      }
      return session
    },

    // Callback sign-in: se ejecuta cuando alguien intenta iniciar sesión
    async signIn({ user, account, profile }: any) {
      // Para OAuth (Google, Facebook), crear o actualizar usuario en BD
      if (account?.provider === "google" || account?.provider === "facebook") {
        console.log(`[${account.provider}] Login:`, user.email);
        
        if (!user.email) {
          console.error(`❌ No email provided by ${account.provider}`);
          return false;
        }

        try {
          const result = await registerOAuthUser({
            email: user.email,
            name: user.name || profile?.name || null,
            image: user.image || profile?.picture || null,
            provider: account.provider,
            providerAccountId: account.providerAccountId || user.id,
          });

          if (!result.success) {
            console.error(`❌ Error registering OAuth user:`, result.error);
            return false;
          }

          // Actualizar el user.id con el ID de la BD
          if (result.user) {
            user.id = result.user.id.toString();
          }

          console.log(`✅ OAuth user processed successfully`);
        } catch (error) {
          console.error(`❌ Exception in signIn callback:`, error);
          return false;
        }
      }
      
      return true; // Permitir login
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

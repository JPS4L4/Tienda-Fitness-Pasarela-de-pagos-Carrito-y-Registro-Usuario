import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role?: string
    image?: string | null
    phone?: string | null
  }

  interface Session extends DefaultSession {
    user: User & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string 
    role?: string
    phone?: string | null
  }
}

// Tipos para registro y login
export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    name: string
  }
  error?: string
}

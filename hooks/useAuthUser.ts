// hooks/useAuthUser.ts
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Hook para obtener fácilmente la información del usuario autenticado
 * Redirige a login si no hay sesión
 */
export function useAuthUser(redirectIfNotAuthenticated = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (redirectIfNotAuthenticated && status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, redirectIfNotAuthenticated, router])

  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    status,
  }
}

/**
 * Hook para obtener solo el usuario (sin redireccionamiento)
 */
export function useUser() {
  const { data: session, status } = useSession()

  return {
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    status,
  }
}

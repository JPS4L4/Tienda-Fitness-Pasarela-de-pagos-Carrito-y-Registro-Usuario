"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await signOut({ callbackUrl: "/" })
      }}
    >
      <button type="submit" className="btn btn-danger btn-block">
        <LogOut className="h-5 w-5" aria-hidden="true" />
        Cerrar sesión
      </button>
    </form>
  )
}

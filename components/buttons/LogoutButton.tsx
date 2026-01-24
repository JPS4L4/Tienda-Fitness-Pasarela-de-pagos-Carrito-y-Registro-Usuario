"use client"

import { signOut } from "next-auth/react"

export function LogoutButton() {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await signOut({ callbackUrl: "/" })
      }}
    >
      <button
        type="submit"
        className="w-full py-3 px-6 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors"
      >
        🚪 Cerrar Sesión
      </button>
    </form>
  )
}

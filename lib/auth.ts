// lib/auth.ts
// Exports for NextAuth - para usar en servidor y cliente

// Para servidor: auth() y getServerSession
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

export async function auth() {
  return getServerSession(authOptions);
}

// Para cliente: signIn y signOut de next-auth/react
export { signIn, signOut } from "next-auth/react";

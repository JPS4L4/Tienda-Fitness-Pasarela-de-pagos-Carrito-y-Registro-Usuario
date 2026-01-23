"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { ReactNode } from "react";

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <CartSidebar />
      </CartProvider>
    </SessionProvider>
  );
}

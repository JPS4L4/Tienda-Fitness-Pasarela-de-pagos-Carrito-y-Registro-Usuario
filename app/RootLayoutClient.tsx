"use client";

import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { ReactNode } from "react";

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartSidebar />
    </CartProvider>
  );
}

"use client";

import CartSidebar from "@/components/drawers/CartSidebar";
import { ReactNode } from "react";

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CartSidebar />
    </>
  );
}

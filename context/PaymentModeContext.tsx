"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PaymentMode } from "@/lib/payments/mode";

// El modo lo lee el servidor (PAYMENT_MODE) y se entrega por contexto: el cliente no depende de una
// variable NEXT_PUBLIC_ congelada en el build.
const PaymentModeContext = createContext<PaymentMode>("demo");

export function PaymentModeProvider({ mode, children }: { mode: PaymentMode; children: ReactNode }) {
  return <PaymentModeContext.Provider value={mode}>{children}</PaymentModeContext.Provider>;
}

export const usePaymentMode = () => useContext(PaymentModeContext);

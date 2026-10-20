import Navbar from "@/components/drawers/Navbar";
import Footer from "@/components/drawers/Footer";
import RootLayoutClient from "@/app/RootLayoutClient";
import { Toaster } from "react-hot-toast";
import { PaymentModeProvider } from "@/context/PaymentModeContext";
import { getPaymentMode } from "@/lib/payments/mode";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Se lee en el servidor sin APIs dinámicas: las páginas estáticas siguen siéndolo (el valor
  // queda fijado al construir); el checkout lo relee en cada petición.
  const mode = getPaymentMode();
  return (
    <PaymentModeProvider mode={mode}>
      <RootLayoutClient>
        <Navbar />
        {children}
        <Toaster position="top-center" />
        <Footer />
      </RootLayoutClient>
    </PaymentModeProvider>
  );
}

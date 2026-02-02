import Navbar from "@/components/drawers/Navbar";
import Footer from "@/components/drawers/Footer";
import RootLayoutClient from "@/app/RootLayoutClient";
import { Toaster } from "react-hot-toast";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootLayoutClient>
      <Navbar />
      {children}
      <Toaster position="top-center" />
      <Footer />
    </RootLayoutClient>
  );
}


import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/drawers/Navbar";
import Footer from "@/components/drawers/Footer";
import RootLayoutClient from "./RootLayoutClient";
import { Toaster } from "react-hot-toast"


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nan Salazar",
  description: "Página de Nan Salazar, entrenador personal y nutricionista",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > 
        <RootLayoutClient>
          <Navbar/>
          {children}
          <Toaster position="top-center" />
          <Footer/>
        </RootLayoutClient>
      </body>
    </html>
  );
}

export default RootLayout

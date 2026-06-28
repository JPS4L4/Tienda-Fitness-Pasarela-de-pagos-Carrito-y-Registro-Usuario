
import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import SessionProviderClient from "./SessionProviderClient";
import CartProviderClient from "./CartProviderClient";
import FavoritesHydrator from "./FavoritesHydrator";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fitness Studio",
  description: "Tienda fitness con productos, planes y entrenamiento personalizado",
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
        <SessionProviderClient>
          <CartProviderClient>
            <FavoritesHydrator />
            {children}
          </CartProviderClient>
        </SessionProviderClient>
      </body>
    </html>
  );
}

export default RootLayout

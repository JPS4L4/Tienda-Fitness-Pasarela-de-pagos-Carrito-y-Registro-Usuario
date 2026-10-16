"use client"

import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"
import { usePathname } from "next/navigation"
import { XIcon } from "@/components/others/XIcon"
import { BRAND_NAME } from "@/lib/brand"
import stripeLogo from "@/images/Logos/stripe-logo-black-transparent.png"
import mercadopagoLogo from "@/images/Logos/logo_mercado_pago_con_letras.webp"

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", hover: "hover:bg-blue-600", icon: <Facebook /> },
  { href: "https://instagram.com", label: "Instagram", hover: "hover:bg-purple-600", icon: <Instagram /> },
  { href: "https://x.com", label: "X", hover: "hover:bg-slate-600", icon: <XIcon /> },
]

const Footer = () => {
  // Ocultar el footer en las páginas de soporte y contacto
  const pathname = usePathname()
  if (pathname === "/support" || pathname === "/contact") {
    return null
  }

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* 1. Redes sociales */}
        <div className="flex justify-center md:justify-start">
          <div className="flex items-center gap-2 rounded-2xl p-2 bg-gray-900 w-fit">
            {socialLinks.map(({ href, label, hover, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`block rounded-full p-1 text-white transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${hover}`}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* 2. Marca, métodos de pago y copyright */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2" aria-label="Métodos de pago aceptados">
            <span className="sr-only">Métodos de pago aceptados:</span>
            <span className="flex h-8 items-center rounded-md bg-white px-3">
              <Image src={stripeLogo} alt="Stripe" height={16} className="h-4 w-auto" />
            </span>
            <span className="flex h-8 items-center rounded-md bg-white px-2">
              <Image src={mercadopagoLogo} alt="Mercado Pago" height={22} className="h-5 w-auto" />
            </span>
          </div>
          <p className="font-mono text-sm text-gray-300">
            {BRAND_NAME} © {new Date().getFullYear()} | Derechos reservados.
          </p>
        </div>

        {/* 3. Enlaces */}
        <nav aria-label="Enlaces del pie de página" className="flex justify-center md:justify-end gap-2 font-mono flex-wrap">
          <Link className="hover:text-orange-400 transition-colors duration-300" href="/contact">Contacto</Link>
          <span aria-hidden="true">|</span>
          <Link className="hover:text-orange-400 transition-colors duration-300" href="/support">Soporte</Link>
          <span aria-hidden="true">|</span>
          <Link className="hover:text-orange-400 transition-colors duration-300" href="/legal">Legal</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer

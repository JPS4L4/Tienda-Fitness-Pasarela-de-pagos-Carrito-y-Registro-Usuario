"use client"

import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"
import { usePathname } from "next/navigation"
import { XIcon } from "@/components/others/XIcon"
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand"
import stripeLogo from "@/images/Logos/stripe-logo-black-transparent.png"
import mercadopagoLogo from "@/images/Logos/logo_mercado_pago_con_letras.webp"

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: <Facebook className="h-5 w-5" /> },
  { href: "https://instagram.com", label: "Instagram", icon: <Instagram className="h-5 w-5" /> },
  { href: "https://x.com", label: "X", icon: <XIcon /> },
]

const footerLinks = [
  { href: "/items", label: "Tienda" },
  { href: "/plans", label: "Planes" },
  { href: "/contact", label: "Contacto" },
  { href: "/support", label: "Soporte" },
  { href: "/legal", label: "Legal" },
]

const Footer = () => {
  // Ocultar el footer en las páginas de soporte y contacto
  const pathname = usePathname()
  if (pathname === "/support" || pathname === "/contact") {
    return null
  }

  return (
    <footer className="mt-0 border-t-2 border-accent bg-surface">
      <div className="container mx-auto grid grid-cols-1 gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* Marca */}
        <div>
          <p className="flex items-center gap-2 font-display text-3xl uppercase leading-none tracking-wide text-fg">
            <span aria-hidden="true" className="inline-block h-7 w-2 -skew-x-12 bg-accent" />
            {BRAND_NAME}
          </p>
          <p className="mt-3 max-w-xs text-muted">{BRAND_TAGLINE}</p>
          <div className="mt-6 flex items-center gap-2">
            {socialLinks.map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center border-2 border-line-strong text-fg transition-colors hover:border-accent hover:bg-accent hover:text-on-accent"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Enlaces */}
        <nav aria-label="Enlaces del pie de página">
          <p className="eyebrow mb-4">Navegar</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-1">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-block py-1 font-bold uppercase tracking-[0.08em] text-fg-soft transition-colors hover:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Pagos */}
        <div>
          <p className="eyebrow mb-4">Pagos seguros</p>
          <div className="flex flex-wrap items-center gap-2" aria-label="Métodos de pago aceptados">
            <span className="sr-only">Métodos de pago aceptados:</span>
            <span className="flex h-11 items-center bg-white px-3">
              <Image src={stripeLogo} alt="Stripe" height={28} className="h-7 w-auto" />
            </span>
            <span className="flex h-11 items-center bg-white px-3">
              <Image src={mercadopagoLogo} alt="Mercado Pago" height={32} className="h-8 w-auto" />
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="container mx-auto px-4 py-4 text-sm text-subtle">
          {BRAND_NAME} © {new Date().getFullYear()}. Derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer

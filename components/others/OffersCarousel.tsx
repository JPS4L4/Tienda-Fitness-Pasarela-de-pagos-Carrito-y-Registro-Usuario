"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules"
import { cn } from "@/lib/utils"

export interface OfferBanner {
  id: number
  title: string
  description: string
  buttonText: string
  buttonLink: string
  image: string
  /** accent: naranja de marca; light: hueso con texto negro */
  tone?: "accent" | "light"
}

/** Data por defecto de las ofertas - Se puede hacer dinámico desde el dashboard */
const DEFAULT_OFFERS: OfferBanner[] = [
  {
    id: 1,
    title: "Oferta de verano: hasta 50% OFF",
    description: "Únete antes del fin de mes y obtén la mitad de precio en tu primer trimestre.",
    buttonText: "Reclamar oferta",
    buttonLink: "/items?discount=true",
    image: "/images/offers/verano.webp",
    tone: "accent",
  },
  {
    id: 2,
    title: "Black Friday: 40% en planes premium",
    description: "Aprovecha esta promoción exclusiva en todos nuestros planes de entrenamiento.",
    buttonText: "Ver planes",
    buttonLink: "/plans",
    image: "/images/offers/premium.webp",
    tone: "light",
  },
  {
    id: 3,
    title: "Pack inicial: equipo + plan",
    description: "Compra tu equipo de entrenamiento y obtén 3 meses gratis de nuestro plan básico.",
    buttonText: "Ver packs",
    buttonLink: "/items",
    image: "/images/offers/pack.webp",
    tone: "accent",
  },
]

interface OffersCarouselProps {
  offers?: OfferBanner[]
}

const arrowClass =
  "absolute bottom-0 z-20 hidden h-12 w-12 items-center justify-center border-2 border-bg bg-bg text-fg transition-colors hover:bg-fg hover:text-bg md:flex"

export default function OffersCarousel({ offers = DEFAULT_OFFERS }: OffersCarouselProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Reserva el mismo alto mientras carga (evita saltos y mismatch de hidratación)
    return <div className="h-[420px] w-full animate-pulse bg-surface-2 md:h-[340px]" aria-hidden="true" />
  }

  return (
    <section className="relative w-full" aria-label="Ofertas">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{ nextEl: ".offers-button-next", prevEl: ".offers-button-prev" }}
        pagination={{
          el: ".offers-pagination",
          clickable: true,
          bulletClass: "offers-pagination-bullet",
          bulletActiveClass: "offers-pagination-bullet-active",
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        speed={400}
        loop={offers.length > 1}
        keyboard={{ enabled: true, onlyInViewport: true }}
        a11y={{ prevSlideMessage: "Oferta anterior", nextSlideMessage: "Siguiente oferta" }}
        className="w-full"
      >
        {offers.map((offer) => {
          const light = offer.tone === "light"
          return (
            <SwiperSlide key={offer.id}>
              <div className={cn("grid grid-cols-1 md:grid-cols-[1.1fr_1fr]", light ? "bg-fg text-bg" : "bg-accent text-on-accent")}>
                <div className="flex flex-col justify-center px-6 py-10 md:px-14 md:py-14">
                  <h2 className="text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">{offer.title}</h2>
                  <p className="mt-4 max-w-md text-lg font-medium">{offer.description}</p>
                  <div className="mt-7">
                    <Link
                      href={offer.buttonLink}
                      className="btn btn-lg border-bg bg-bg text-fg shadow-[4px_4px_0_0_rgb(10_10_11/0.35)] hover:bg-surface-3"
                    >
                      {offer.buttonText}
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {/* Imagen con proporción fija, corte diagonal en escritorio */}
                <div className="offer-media relative aspect-[16/9] md:aspect-auto md:min-h-[340px]">
                  <Image
                    src={offer.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                    style={{ filter: "contrast(1.08) saturate(0.85)" }}
                  />
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>

      {offers.length > 1 && (
        <>
          <button className={`offers-button-prev right-12 ${arrowClass}`} aria-label="Oferta anterior">
            <ChevronLeft className="h-6 w-6" strokeWidth={3} />
          </button>
          <button className={`offers-button-next right-0 ${arrowClass}`} aria-label="Siguiente oferta">
            <ChevronRight className="h-6 w-6" strokeWidth={3} />
          </button>
          <div className="offers-pagination absolute bottom-4 left-6 z-20 flex md:left-14" />
        </>
      )}
    </section>
  )
}

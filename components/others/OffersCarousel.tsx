"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules"

/**
 * Tipo para cada oferta del carousel
 */
export interface OfferBanner {
  id: number
  title: string
  description: string
  buttonText: string
  buttonLink: string
  image: string
  bgColor?: string
  textColor?: string
}

/**
 * Data por defecto de las ofertas - Se puede hacer dinámico desde el dashboard
 */
const DEFAULT_OFFERS: OfferBanner[] = [
  {
    id: 1,
    title: "Oferta de Verano: Hasta 50% OFF",
    description: "Únete antes del fin de mes y obtén la mitad de precio en tu primer trimestre.",
    buttonText: "Reclamar Oferta",
    buttonLink: "/items?discount=true",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1470&auto=format&fit=crop",
    bgColor: "bg-gradient-to-r from-red-600 to-red-700",
    textColor: "text-white"
  },
  {
    id: 2,
    title: "Black Friday: 40% en Planes Premium",
    description: "Aprovecha esta promoción exclusiva en todos nuestros planes de entrenamiento.",
    buttonText: "Ver Planes",
    buttonLink: "/plans",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1470&auto=format&fit=crop",
    bgColor: "bg-gradient-to-r from-slate-800 to-slate-900",
    textColor: "text-white"
  },
  {
    id: 3,
    title: "Pack Inicial: Equipo + Plan",
    description: "Compra tu equipo de entrenamiento y obtén 3 meses gratis de nuestro plan básico.",
    buttonText: "Ver Packs",
    buttonLink: "/items",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
    bgColor: "bg-gradient-to-r from-indigo-600 to-purple-700",
    textColor: "text-white"
  }
]

interface OffersCarouselProps {
  offers?: OfferBanner[]
}

export default function OffersCarousel({ offers = DEFAULT_OFFERS }: OffersCarouselProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Fallback mientras carga para evitar hidratación mismatch
    return (
      <section className="bg-red-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex items-center justify-between">
            <div className="flex-1">
              <div className="h-8 bg-white/20 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-white/20 rounded w-full mb-6"></div>
              <div className="h-10 bg-white/30 rounded w-40"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full py-12 md:py-16 overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: ".offers-button-next",
          prevEl: ".offers-button-prev",
        }}
        pagination={{
          el: ".offers-pagination",
          clickable: true,
          bulletClass: "offers-pagination-bullet",
          bulletActiveClass: "offers-pagination-bullet-active",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={600}
        loop={offers.length > 1}
        grabCursor={true}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        a11y={{
          prevSlideMessage: "Oferta anterior",
          nextSlideMessage: "Siguiente oferta",
        }}
        className="w-full h-full"
      >
        {offers.map((offer) => (
          <SwiperSlide key={offer.id}>
            <div className="relative ">
              {/* Contenedor con imagen de fondo y contenido */}
              <div className={`relative ${offer.bgColor || "bg-linear-to-r from-red-600 to-red-700"}`}>
                {/* Imagen de fondo con overlay */}
                <div className="absolute inset-0 opacity-20">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>

                {/* Contenido del banner */}
                <div className="relative container mx-auto px-20 py-12 md:py-16">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Texto y CTA */}
                    <div className="max-w-xl text-center md:text-left">
                      <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 ${offer.textColor || "text-white"}`}>
                        {offer.title}
                      </h2>
                      <p className={`text-base sm:text-lg mb-4 md:mb-6 ${offer.textColor || "text-white"} opacity-90`}>
                        {offer.description}
                      </p>
                      <Link
                        href={offer.buttonLink}
                        className="inline-block bg-white text-red-700 hover:bg-gray-100 px-6 md:px-8 py-3 md:py-3.5 rounded-lg font-bold text-sm md:text-base transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                      >
                        {offer.buttonText}
                      </Link>
                    </div>

                    {/* Decoración/Badge */}
                    <div className="hidden md:block">
                      <div className={`text-7xl lg:text-9xl font-extrabold ${offer.textColor || "text-white"} opacity-20 select-none`}>
                        ¡SALE!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Controles de navegación - Solo si hay más de 1 oferta */}
      {offers.length > 1 && (
        <>
          <button
            className="offers-button-prev absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full w-9 h-9 md:w-11 md:h-11 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 group"
            aria-label="Oferta anterior"
          >
            <svg className="w-5 h-5 text-white group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className="offers-button-next absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full w-9 h-9 md:w-11 md:h-11 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 group"
            aria-label="Siguiente oferta"
          >
            <svg className="w-5 h-5 text-white group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Paginación (dots) */}
          <div className="offers-pagination absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2" />
        </>
      )}
    </section>
  )
}

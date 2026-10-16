"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, EffectFade, A11y } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"

/**
 * Tipo para cada slide del carousel
 */
interface HeroSlide {
  id: number
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  image: string
  imageAlt: string
  /** Capa de color con alfa sobre la foto (legibilidad del texto) */
  overlay: string
  textColor?: string
}

/**
 * Slides del hero. Fotos en public/images/hero (créditos en public/images/CREDITS.md)
 */
const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: "Define tu Fuerza",
    subtitle: "Entrenamiento personalizado para alcanzar tus objetivos",
    ctaText: "Comenzar Ahora",
    ctaLink: "/plans",
    image: "/images/hero/fuerza.webp",
    imageAlt: "Persona levantando una barra con discos en un gimnasio",
    overlay: "from-slate-950/85 via-slate-950/55 to-slate-950/25",
    textColor: "text-white"
  },
  {
    id: 2,
    title: "Transforma tu Vida",
    subtitle: "Planes de nutrición y ejercicio diseñados para ti",
    ctaText: "Ver Planes",
    ctaLink: "/plans",
    image: "/images/hero/transforma.webp",
    imageAlt: "Entrenador guiando un ejercicio al aire libre",
    overlay: "from-indigo-950/85 via-indigo-950/55 to-slate-950/25",
    textColor: "text-white"
  },
  {
    id: 3,
    title: "Ofertas Especiales",
    subtitle: "50% OFF en tu primer mes - Únete hoy",
    ctaText: "Ver Ofertas",
    ctaLink: "/items?discount=true",
    image: "/images/hero/ofertas.webp",
    imageAlt: "Mancuernas y botella sobre una colchoneta de yoga",
    overlay: "from-rose-950/85 via-slate-950/55 to-slate-950/25",
    textColor: "text-white"
  },
  {
    id: 4,
    title: "Equipo Premium",
    subtitle: "Descubre los mejores productos para tu entrenamiento",
    ctaText: "Ver Tienda",
    ctaLink: "/items",
    image: "/images/hero/equipo.webp",
    imageAlt: "Estante con mancuernas en un gimnasio",
    overlay: "from-teal-950/85 via-slate-950/55 to-slate-950/25",
    textColor: "text-white"
  }
]

export default function HeroCarousel() {
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)

  // Manejar pause/resume del autoplay
  const handleMouseEnter = () => {
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.stop()
      setIsAutoplayPaused(true)
    }
  }

  const handleMouseLeave = () => {
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.start()
      setIsAutoplayPaused(false)
    }
  }

  return (
    <section 
      className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Hero carousel"
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        pagination={{
          el: ".swiper-pagination-custom",
          clickable: true,
          bulletClass: "swiper-pagination-bullet-custom",
          bulletActiveClass: "swiper-pagination-bullet-active-custom",
        }}
        autoplay={{
          delay: 7000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={800}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        grabCursor={true}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        a11y={{
          prevSlideMessage: "Slide anterior",
          nextSlideMessage: "Siguiente slide",
          firstSlideMessage: "Este es el primer slide",
          lastSlideMessage: "Este es el último slide",
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        className="w-full h-full"
      >
        {HERO_SLIDES.map((slide, index) => {
          const Title = index === 0 ? "h1" : "h2"
          return (
          <SwiperSlide key={slide.id}>
            {/* Contenedor del slide */}
            <div className="relative w-full h-full">
              {/* Imagen de fondo con Next/Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  priority={index === 0}
                  quality={75}
                  sizes="100vw"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCgAA8A/9k="
                />
                
                {/* Overlay con gradiente */}
                <div 
                  className={`absolute inset-0 bg-slate-950/20 bg-linear-to-r ${slide.overlay}`}
                  aria-hidden="true"
                />
              </div>

              {/* Contenido del slide */}
              <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                  {/* Título */}
                  <Title 
                    className={`
                      text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
                      font-black ${slide.textColor || "text-white"} 
                      mb-4 sm:mb-6 
                      tracking-tighter 
                      uppercase 
                      animate-fade-in-up
                      drop-shadow-2xl
                    `}
                  >
                    {slide.title}
                  </Title>

                  {/* Subtítulo */}
                  <p 
                    className={`
                      text-lg sm:text-xl md:text-2xl 
                      ${slide.textColor || "text-gray-200"} 
                      mb-6 sm:mb-8 
                      font-light 
                      max-w-2xl mx-auto
                      animate-fade-in-up
                      animation-delay-200
                      drop-shadow-lg
                    `}
                  >
                    {slide.subtitle}
                  </p>

                  {/* CTA Button */}
                  <Link 
                    href={slide.ctaLink}
                    className="
                      inline-block
                      bg-white text-black 
                      hover:bg-gray-100 
                      px-6 sm:px-8 md:px-10 
                      py-3 sm:py-4 
                      rounded-full 
                      font-bold 
                      text-sm sm:text-base md:text-lg
                      transition-all 
                      duration-300
                      hover:scale-105 
                      hover:shadow-2xl
                      active:scale-95
                      uppercase 
                      tracking-widest
                      animate-fade-in-up
                      animation-delay-400
                      focus:outline-none
                      focus:ring-4
                      focus:ring-white/50
                    "
                    aria-label={`${slide.ctaText} - ${slide.title}`}
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
          )
        })}
      </Swiper>

      {/* Controles personalizados - Flechas de navegación */}
      <button
        className="
          swiper-button-prev-custom
          absolute 
          left-2 sm:left-4 md:left-8 
          top-1/2 
          -translate-y-1/2 
          z-20
          bg-white/20 
          hover:bg-white/40 
          backdrop-blur-sm
          rounded-full 
          w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
          flex 
          items-center 
          justify-center
          transition-all 
          duration-300
          hover:scale-110
          focus:outline-none
          focus:ring-4
          focus:ring-white/50
          group
        "
        aria-label="Slide anterior"
      >
        <svg 
          className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-125 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        className="
          swiper-button-next-custom
          absolute 
          right-2 sm:right-4 md:right-8 
          top-1/2 
          -translate-y-1/2 
          z-20
          bg-white/20 
          hover:bg-white/40 
          backdrop-blur-sm
          rounded-full 
          w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
          flex 
          items-center 
          justify-center
          transition-all 
          duration-300
          hover:scale-110
          focus:outline-none
          focus:ring-4
          focus:ring-white/50
          group
        "
        aria-label="Siguiente slide"
      >
        <svg 
          className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-125 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Paginación (dots) */}
      <div 
        className="
          swiper-pagination-custom 
          absolute 
          bottom-4 sm:bottom-6 md:bottom-8 
          left-0 
          right-0 
          z-20 
          flex 
          justify-center 
          gap-2 sm:gap-3
        "
        aria-label="Indicadores de slides"
      />

      {/* Indicador de pausa (opcional) */}
      {isAutoplayPaused && (
        <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-xs font-medium">En pausa</span>
        </div>
      )}
    </section>
  )
}

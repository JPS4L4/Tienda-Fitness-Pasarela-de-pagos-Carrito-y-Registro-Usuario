"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, EffectFade, A11y } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"

interface HeroSlide {
  id: number
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  image: string
  imageAlt: string
  /** Punto focal de la foto (object-position) para que el sujeto no quede tapado por el texto */
  focus: string
}

/** Slides del hero. Fotos en public/images/hero (créditos en public/images/CREDITS.md) */
const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: "Define tu fuerza",
    subtitle: "Entrenamiento personalizado para alcanzar tus objetivos.",
    ctaText: "Comenzar ahora",
    ctaLink: "/plans",
    image: "/images/hero/fuerza.webp",
    imageAlt: "Persona levantando una barra con discos en un gimnasio",
    focus: "70% 40%",
  },
  {
    id: 2,
    title: "Transforma tu vida",
    subtitle: "Planes de nutrición y ejercicio diseñados para ti.",
    ctaText: "Ver planes",
    ctaLink: "/plans",
    image: "/images/hero/transforma.webp",
    imageAlt: "Entrenador guiando un ejercicio al aire libre",
    focus: "75% 40%",
  },
  {
    id: 3,
    title: "Ofertas especiales",
    subtitle: "Hasta 50% de descuento en equipo y suplementos.",
    ctaText: "Ver ofertas",
    ctaLink: "/items?discount=true",
    image: "/images/hero/ofertas.webp",
    imageAlt: "Mancuernas y botella sobre una colchoneta de yoga",
    focus: "70% 50%",
  },
  {
    id: 4,
    title: "Equipo premium",
    subtitle: "Los mejores productos para tu entrenamiento.",
    ctaText: "Ver tienda",
    ctaLink: "/items",
    image: "/images/hero/equipo.webp",
    imageAlt: "Estante con mancuernas en un gimnasio",
    focus: "70% 50%",
  },
]

const arrowClass =
  "absolute top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center border-2 border-fg/40 bg-bg/70 text-fg transition-colors hover:border-accent hover:bg-accent hover:text-on-accent sm:flex"

export default function HeroCarousel() {
  const swiperRef = useRef<SwiperType | null>(null)

  return (
    <section
      className="hero-cut relative h-[calc(100svh-66px)] min-h-[520px] max-h-[760px] w-full overflow-hidden bg-bg"
      aria-label="Destacados"
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{ nextEl: ".swiper-button-next-custom", prevEl: ".swiper-button-prev-custom" }}
        pagination={{
          el: ".swiper-pagination-custom",
          clickable: true,
          bulletClass: "swiper-pagination-bullet-custom",
          bulletActiveClass: "swiper-pagination-bullet-active-custom",
        }}
        autoplay={{ delay: 7000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        speed={500}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        keyboard={{ enabled: true, onlyInViewport: true }}
        a11y={{
          prevSlideMessage: "Slide anterior",
          nextSlideMessage: "Siguiente slide",
          firstSlideMessage: "Este es el primer slide",
          lastSlideMessage: "Este es el último slide",
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        className="h-full w-full"
      >
        {HERO_SLIDES.map((slide, index) => {
          const Title = index === 0 ? "h1" : "h2"
          return (
            <SwiperSlide key={slide.id}>
              <div className="relative h-full w-full">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  priority={index === 0}
                  quality={75}
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: slide.focus, filter: "contrast(1.08) saturate(0.85)" }}
                />
                {/* Capa para legibilidad: negro sólido bajo el texto, foto visible en el resto */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/10 md:bg-gradient-to-r md:from-bg md:via-bg/60 md:to-bg/5"
                  aria-hidden="true"
                />

                <div className="container relative z-10 mx-auto flex h-full items-end px-4 pb-20 md:items-center md:pb-14">
                  <div className="max-w-3xl">
                    <div className="mb-5 h-2 w-24 bg-accent" aria-hidden="true" />
                    <Title className="animate-fade-in-up text-[clamp(3rem,9vw,7.5rem)] leading-[0.92] text-fg">
                      {slide.title}
                    </Title>
                    <p className="animate-fade-in-up animation-delay-200 mt-5 max-w-xl text-lg font-medium text-fg-soft sm:text-xl">
                      {slide.subtitle}
                    </p>
                    <div className="animate-fade-in-up animation-delay-400 mt-8">
                      <Link
                        href={slide.ctaLink}
                        className="btn btn-primary btn-lg"
                        aria-label={`${slide.ctaText}: ${slide.title}`}
                      >
                        {slide.ctaText}
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>

      <button className={`swiper-button-prev-custom left-4 md:left-8 ${arrowClass}`} aria-label="Slide anterior">
        <ChevronLeft className="h-7 w-7" strokeWidth={3} />
      </button>
      <button className={`swiper-button-next-custom right-4 md:right-8 ${arrowClass}`} aria-label="Siguiente slide">
        <ChevronRight className="h-7 w-7" strokeWidth={3} />
      </button>

      <div
        className="swiper-pagination-custom absolute bottom-14 left-0 right-0 z-20 container mx-auto flex px-4"
        aria-label="Indicadores de slides"
      />
    </section>
  )
}

"use client"

import { Wallpaper } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  className?: string                  // clases para la imagen (object-cover, etc.)
  containerClassName?: string         // clases adicionales para el contenedor
  fallback?: React.ReactNode
  priority?: boolean                  // para imágenes above the fold
  sizes?: string                      // ej: "100vw", "(max-width: 768px) 50vw, 33vw"
}

export const SafeImage = ({
  src,
  alt,
  className = "object-cover",         // por defecto object-cover (lo más común)
  containerClassName = "",
  fallback = <Wallpaper className="w-16 h-16 text-gray-400" />,
  priority = false,
  sizes,
}: SafeImageProps) => {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Si no hay src o error → mostrar fallback
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center w-full h-full bg-gray-100 rounded-xl ${containerClassName}`}>
        {fallback}
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gray-50 rounded-xl ${containerClassName}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className={`transition-transform duration-700 ${className} ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoadingComplete={() => setLoading(false)}
        onError={() => {
          console.log('Error cargando imagen:', src)
          setError(true)
        }}
        unoptimized={true}           // temporal para debug de imágenes remotas
        priority={priority}
        sizes={sizes || "100vw"}     // por defecto asume full width
        quality={85}                 // balance entre calidad y velocidad
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
          <div className="animate-pulse bg-gray-300 w-12 h-12 rounded-full" />
        </div>
      )}
    </div>
  )
}
"use client"

import { ImageOff } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  className?: string // clases para la imagen (object-cover, etc.)
  containerClassName?: string // el padre define la proporción (aspect-*) o el alto
  fallback?: React.ReactNode
  priority?: boolean // para imágenes above the fold
  sizes?: string // ej: "(min-width: 1024px) 25vw, 50vw"
}

/**
 * Imagen con contenedor de proporción fija: el padre aporta el aspect-ratio
 * (o un alto) y la imagen rellena con object-cover. Nada se estira.
 */
export const SafeImage = ({
  src,
  alt,
  className = "object-cover",
  containerClassName = "",
  fallback = <ImageOff className="h-10 w-10 text-subtle" aria-hidden="true" />,
  priority = false,
  sizes,
}: SafeImageProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-surface-2", containerClassName)}>
        {fallback}
      </div>
    )
  }

  const loading = loadedSrc !== src

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-surface-2", containerClassName)}>
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("transition-opacity duration-300", className, loading ? "opacity-0" : "opacity-100")}
        onLoad={() => setLoadedSrc(src)}
        onError={() => setFailedSrc(src)}
        priority={priority}
        sizes={sizes || "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
        quality={75}
      />
    </div>
  )
}

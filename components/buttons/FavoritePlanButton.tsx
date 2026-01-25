"use client"

import { Heart } from "lucide-react"
import { useFavoritesStore } from "@/lib/stores/favoritesStore"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

interface FavoritePlanButtonProps {
  id: number
  title: string
  image?: string
  slug: string
}

export default function FavoritePlanButton({ id, title, image, slug }: FavoritePlanButtonProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore()
  const favorite = isFavorite(id, "plan")

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (favorite) {
      removeFavorite(id, "plan")
      toast.success("Plan eliminado de favoritos", { duration: 2000 })
    } else {
      addFavorite({ id, type: "plan", title, image, slug })
      toast.success("Plan agregado a favoritos", { duration: 2000 })
    }
  }

  return (
    <button
      onClick={toggle}
      className="p-3 rounded-full bg-white/90 backdrop-blur-md border-2 border-gray-200 hover:border-red-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
      aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      <Heart
        className={cn(
          "w-6 h-6 transition-all duration-300",
          favorite
            ? "fill-red-500 text-red-500 scale-110"
            : "text-gray-400 hover:text-red-500"
        )}
      />
    </button>
  )
}

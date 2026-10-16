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

  const toggle = () => {
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
      type="button"
      onClick={toggle}
      aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={favorite}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center border-2 transition-colors",
        favorite
          ? "border-accent bg-accent text-on-accent"
          : "border-line-strong text-fg hover:border-accent hover:text-accent"
      )}
    >
      <Heart className={cn("h-5 w-5", favorite && "fill-current")} />
    </button>
  )
}

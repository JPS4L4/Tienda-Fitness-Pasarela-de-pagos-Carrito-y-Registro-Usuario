"use client";

import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/lib/stores/favoritesStore";

interface FavoriteItemButtonProps {
  id: number;
  title: string;
  image?: string;
  slug: string;
}

export default function FavoriteItemButton({ id, title, image, slug }: FavoriteItemButtonProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const isFav = isFavorite(id, "item");

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(id, "item");
      toast.success("Eliminado de favoritos ❤️", { duration: 3000 });
    } else {
      addFavorite({ id, type: "item", title, image, slug });
      toast.success("Agregado a favoritos ❤️", { duration: 3000 });
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
      className={cn(
        "inline-flex items-center justify-center h-11 w-11 rounded-full border transition-colors",
        isFav
          ? "bg-red-50 border-red-200 text-red-600"
          : "bg-white border-gray-200 text-gray-500 hover:text-red-500"
      )}
    >
      <Heart className={cn("w-5 h-5", isFav ? "fill-red-500 text-red-500" : "text-red-500")} />
    </button>
  );
}

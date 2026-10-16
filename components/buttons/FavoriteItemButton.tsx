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
      toast.success("Eliminado de favoritos", { duration: 3000 });
    } else {
      addFavorite({ id, type: "item", title, image, slug });
      toast.success("Agregado a favoritos", { duration: 3000 });
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={isFav}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center border-2 transition-colors",
        isFav
          ? "border-accent bg-accent text-on-accent"
          : "border-line-strong text-fg hover:border-accent hover:text-accent"
      )}
    >
      <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
    </button>
  );
}

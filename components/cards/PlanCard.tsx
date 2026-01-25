"use client"

import { Check, Apple, Dumbbell, ArrowRight, Heart } from "lucide-react"
import Link from "next/link"
import { useFavoritesStore } from "@/lib/stores/favoritesStore"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils" // si no tienes cn, agrégalo (ver abajo)

const typeStyles = {
  nutricion: {
    icon: <Apple className="text-emerald-600" size={24} />,
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    button: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
    accent: "text-emerald-600",
    hoverAccent: "group-hover:text-emerald-700",
  },
  entrenamiento: {
    icon: <Dumbbell className="text-indigo-600" size={24} />,
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    button: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
    accent: "text-indigo-600",
    hoverAccent: "group-hover:text-indigo-700",
  }
}

const FavoriteButton = ({ 
  id, 
  title, 
  image, 
  slug 
}: { 
  id: number | string
  title: string
  image?: string
  slug: string 
}) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore()
  const favorite = isFavorite(id, "plan")

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (favorite) {
      removeFavorite(id, "plan")
      toast.success("Eliminado de favoritos ❤️", { duration: 3000 })
    } else {
      addFavorite({ id, type: "plan", title, image, slug })
      toast.success("Agregado a favoritos ❤️", {
        duration: 4000,
        
      })
    }
  }

  return (
    <button
      onClick={toggle}
      className="relative p-3 rounded-full bg-white/90 backdrop-blur-md shadow-md hover:bg-white hover:shadow-xl transition-all duration-300"
      aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      <Heart
        className={cn(
          "w-7 h-7 transition-all duration-300 ease-out",
          favorite
            ? "fill-red-500 text-red-500 scale-110 animate-heartbeat"
            : "text-red-500 hover:text-red-600 hover:scale-110"
        )}
      />
    </button>
  )
}

export const PlanCard = ({ plan }: { plan: any }) => {
  const style = typeStyles[plan.type as keyof typeof typeStyles] || typeStyles.nutricion

  return (
    <div className={cn(
      "group relative bg-white rounded-3xl border border-slate-200 overflow-hidden",
      "flex flex-col h-full hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2",
      "transition-all duration-300 ease-out cursor-pointer"
    )}>
      {/* Decoración de fondo sutil */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-gradient-to-br from-white/40 to-transparent pointer-events-none"
      )} />

      {/* Contenido principal */}
      <div className="relative p-8 flex flex-col flex-1">
        {/* Header: Icono + Badge */}
        <div className="flex justify-between items-start mb-6">
          <div className="p-4 bg-slate-50 rounded-2xl shadow-sm">
            {style.icon}
          </div>
          <span className={cn(
            "text-xs uppercase font-bold tracking-widest px-4 py-2 rounded-full border",
            style.badge
          )}>
            {plan.type}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 leading-tight group-hover:text-slate-800 transition-colors">
          {plan.title}
        </h3>

        {/* Precio */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {plan.price}
          </span>
          <span className="text-slate-500 text-lg">/ total</span>
        </div>

        {/* Beneficios */}
        <ul className="space-y-4 mb-10">
          {plan.coverage.map((c: string, i: number) => (
            <li 
              key={i} 
              className="flex items-start gap-4 group/item transition-colors"
            >
              <div className={cn(
                "mt-1 p-1 rounded-full",
                style.accent,
                "bg-opacity-10"
              )}>
                <Check className={cn("w-6 h-6", style.accent)} strokeWidth={3} />
              </div>
              <span className={cn(
                "text-slate-700 text-base leading-relaxed",
                "group-hover/item:text-slate-900 transition-colors"
              )}>
                {c}
              </span>
            </li>
          ))}
        </ul>

        {/* Botones de acción */}
        <div className="mt-auto flex items-center gap-4">
          <Link 
            href={`/plans/${plan.slug}`} 
            className={cn(
              "flex-1 flex items-center justify-center gap-3 py-5 px-8 rounded-2xl font-bold text-white",
              "text-lg shadow-xl transition-all duration-300 active:scale-95",
              style.button
            )}
            prefetch
          >
            Saber más
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          <FavoriteButton 
            id={plan.id} 
            title={plan.title} 
            image={plan.image} 
            slug={plan.slug} 
          />
        </div>
      </div>
    </div>
  )
}
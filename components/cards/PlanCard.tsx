"use client"

import { formatPrice, getPriceDisplay, PRICE_UNAVAILABLE } from "@/lib/money"
import { durationSuffix } from "@/lib/planDuration"
import { Check, Apple, Dumbbell, ArrowRight, Heart } from "lucide-react"
import Link from "next/link"
import { useFavoritesStore } from "@/lib/stores/favoritesStore"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { SafeImage } from "@/components/others/SafeImage"
import { Badge } from "@/components/ui/Badge"
import type { PlanUI } from "@/app/src/types/plan"

const TYPE_ICON = {
  nutricion: Apple,
  entrenamiento: Dumbbell,
} as const

const FavoriteButton = ({
  id,
  title,
  image,
  slug,
}: {
  id: number | string
  title: string
  image?: string
  slug: string
}) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore()
  const favorite = isFavorite(id, "plan")

  const toggle = () => {
    if (favorite) {
      removeFavorite(id, "plan")
      toast.success("Eliminado de favoritos", { duration: 3000 })
    } else {
      addFavorite({ id, type: "plan", title, image, slug })
      toast.success("Agregado a favoritos", { duration: 4000 })
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-ghost h-12 w-12 shrink-0 px-0"
      aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={favorite}
    >
      <Heart className={cn("h-5 w-5", favorite && "fill-current text-accent animate-heartbeat")} />
    </button>
  )
}

export const PlanCard = ({ plan }: { plan: PlanUI }) => {
  const Icon = TYPE_ICON[plan.type as keyof typeof TYPE_ICON] ?? Dumbbell
  const { valid: hasValidPrice, final, previous, badge } = getPriceDisplay(plan)
  const actualPrice = hasValidPrice ? formatPrice(final, plan.currency) : PRICE_UNAVAILABLE

  return (
    <article className="group relative flex h-full w-full flex-col border border-line bg-surface transition-colors duration-150 hover:border-accent">
      {/* Imagen: proporción fija 16:10 */}
      <div className="media aspect-[16/10]">
        <Link href={`/plans/${plan.slug}`} aria-label={`Ver ${plan.title}`} className="absolute inset-0 block">
          <SafeImage
            src={plan.image}
            alt={plan.title}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-0 top-0 flex flex-col items-start gap-1">
          <Badge tone="accent">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {plan.type}
          </Badge>
          {badge && <Badge className="bg-bg text-fg">-{badge}%</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-4 min-h-[2.2em] text-2xl leading-[1.1] text-fg md:text-3xl">{plan.title}</h3>

        <div className="mb-5">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="price text-4xl text-fg md:text-5xl">{actualPrice}</span>
            {hasValidPrice && (
              <span className="text-sm font-semibold uppercase tracking-wider text-muted">{durationSuffix(plan.durationType)}</span>
            )}
          </div>
          {previous && (
            <p className="mt-1 text-sm text-muted">
              Antes <span className="line-through">{formatPrice(previous, plan.currency)}</span>
            </p>
          )}
        </div>

        <ul className="mb-8 space-y-3">
          {plan.coverage.slice(0, 4).map((c: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-fg-soft">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={3} aria-hidden="true" />
              <span className="leading-snug">{c}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center gap-3">
          <Link href={`/plans/${plan.slug}`} className="btn btn-primary flex-1" prefetch>
            Saber más
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <FavoriteButton id={plan.id} title={plan.title} image={plan.image} slug={plan.slug} />
        </div>
      </div>
    </article>
  )
}

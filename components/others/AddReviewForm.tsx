"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Star } from "lucide-react"

interface AddReviewFormProps {
  onReviewAdded?: () => void
  productId?: number
  planId?: number
}

export default function AddReviewForm({ onReviewAdded, productId, planId }: AddReviewFormProps) {
  const { data: session, status } = useSession()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [eligibilityChecked, setEligibilityChecked] = useState(false)
  const [canReview, setCanReview] = useState(true)
  const [eligibilityMessage, setEligibilityMessage] = useState<string | null>(null)

  const targetType = planId ? "plan" : "producto"

  const loadEligibility = async () => {
    if ((!productId && !planId) || !session) {
      setEligibilityChecked(true)
      return
    }

    try {
      const query = planId ? `planId=${planId}` : `productId=${productId}`
      const res = await fetch(`/api/comments/eligibility?${query}`)
      const data = await res.json()

      if (!res.ok) {
        setCanReview(false)
        setEligibilityMessage("No fue posible validar tu compra")
        return
      }

      if (!data.eligible) {
        setCanReview(false)
        if (data.reason === "NOT_PURCHASED") {
          setEligibilityMessage(`Solo puedes calificar ${targetType}s que hayas comprado`)
        } else if (data.reason === "ALREADY_REVIEWED") {
          setEligibilityMessage(`Ya has dejado una reseña para este ${targetType}`)
        } else {
          setEligibilityMessage(`No tienes acceso para calificar este ${targetType}`)
        }
      } else {
        setCanReview(true)
        setEligibilityMessage(null)
      }
    } catch {
      setCanReview(false)
      setEligibilityMessage("No fue posible validar tu compra")
    } finally {
      setEligibilityChecked(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      setError("Debes iniciar sesión para dejar una reseña")
      return
    }

    if (rating === 0) {
      setError("Por favor selecciona una calificación")
      return
    }

    if (content.trim().length < 10) {
      setError("La reseña debe tener al menos 10 caracteres")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          content: content.trim(),
          ...(productId ? { productId } : {}),
          ...(planId ? { planId } : {}),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar la reseña")
      }

      setSuccess(true)
      setRating(0)
      setContent("")
      
      // Llamar callback si existe
      if (onReviewAdded) {
        onReviewAdded()
      }

      // Resetear mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false)
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la reseña")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId && planId) {
      setEligibilityChecked(true)
      setCanReview(false)
      setEligibilityMessage("No puedes calificar producto y plan al mismo tiempo")
      return
    }

    if ((!productId && !planId) || !session) {
      setEligibilityChecked(true)
      return
    }

    loadEligibility()
  }, [productId, planId, session])

  // Si no está autenticado, mostrar mensaje
  if (status === "loading") {
    return (
      <div className="bg-surface   p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-3  w-1/3 mb-4"></div>
          <div className="h-20 bg-surface-3  mb-4"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="panel">
        <div className="text-center">
          <div className="inline-block p-4 bg-accent/10  mb-4">
            <Star className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-bold text-fg mb-2">
            ¿Quieres dejar una reseña?
          </h3>
          <p className="text-muted mb-6">
            Inicia sesión para compartir tu experiencia con nuestra comunidad
          </p>
          <a
            href="/login"
            className="btn btn-primary"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    )
  }

  if (eligibilityChecked && !canReview) {
    return (
      <div className="panel">
        <div className="text-center">
          <div className="inline-block p-4 bg-accent/10  mb-4">
            <Star className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-bold text-fg mb-2">
            Reseñas disponibles tras la compra
          </h3>
          <p className="text-muted">
            {eligibilityMessage || `No tienes acceso para calificar este ${targetType}`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <h3 className="text-2xl font-bold text-fg mb-6">
        Comparte tu experiencia
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Calificación con estrellas */}
        <div>
          <label className="label">
            Tu calificación
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? "fill-accent text-accent"
                      : "text-subtle"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted mt-2">
              {rating === 1 && "Muy insatisfecho"}
              {rating === 2 && "Insatisfecho"}
              {rating === 3 && "Neutral"}
              {rating === 4 && "Satisfecho"}
              {rating === 5 && "Muy satisfecho"}
            </p>
          )}
        </div>

        {/* Texto de la reseña */}
        <div>
          <label htmlFor="review-content" className="label">
            Tu reseña
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Cuéntanos sobre tu experiencia..."
            rows={5}
            className="input resize-none"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted">
              Mínimo 10 caracteres
            </p>
            <p className="text-xs text-muted">
              {content.length}/500
            </p>
          </div>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="bg-danger/10 border-l-4 border-danger p-4 ">
            <p className="text-danger text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-ok/10 border-l-4 border-ok p-4 ">
            <p className="text-ok text-sm font-medium">
              ¡Gracias por tu reseña! Se ha publicado correctamente.
            </p>
          </div>
        )}

        {/* Botón de enviar */}
        <button
          type="submit"
          disabled={loading || rating === 0 || content.trim().length < 10}
          className="btn btn-primary btn-lg btn-block"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner !h-5 !w-5" aria-hidden="true" />
              Enviando...
            </span>
          ) : (
            "Publicar Reseña"
          )}
        </button>

        {/* Info del usuario */}
        <div className="pt-4 border-t border-line">
          <p className="text-sm text-muted">
            Publicando como:{" "}
            <span className="font-semibold text-fg">
              {session.user?.name || session.user?.email}
            </span>
          </p>
        </div>
      </form>
    </div>
  )
}

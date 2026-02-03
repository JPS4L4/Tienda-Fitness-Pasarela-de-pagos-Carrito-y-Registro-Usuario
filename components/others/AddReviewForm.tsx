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
    } catch (err) {
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
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg p-8 border border-slate-200">
        <div className="text-center">
          <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
            <Star className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            ¿Quieres dejar una reseña?
          </h3>
          <p className="text-slate-600 mb-6">
            Inicia sesión para compartir tu experiencia con nuestra comunidad
          </p>
          <a
            href="/login"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    )
  }

  if (eligibilityChecked && !canReview) {
    return (
      <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg p-8 border border-slate-200">
        <div className="text-center">
          <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
            <Star className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Reseñas disponibles tras la compra
          </h3>
          <p className="text-slate-600">
            {eligibilityMessage || `No tienes acceso para calificar este ${targetType}`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">
        Comparte tu experiencia
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Calificación con estrellas */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-slate-600 mt-2">
              {rating === 1 && "😞 Muy insatisfecho"}
              {rating === 2 && "😕 Insatisfecho"}
              {rating === 3 && "😐 Neutral"}
              {rating === 4 && "😊 Satisfecho"}
              {rating === 5 && "🤩 Muy satisfecho"}
            </p>
          )}
        </div>

        {/* Texto de la reseña */}
        <div>
          <label htmlFor="review-content" className="block text-sm font-semibold text-slate-700 mb-2">
            Tu reseña
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Cuéntanos sobre tu experiencia..."
            rows={5}
            className="w-full px-4 py-3 text-slate-900 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-slate-500">
              Mínimo 10 caracteres
            </p>
            <p className="text-xs text-slate-500">
              {content.length}/500
            </p>
          </div>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-green-700 text-sm font-medium">
              ¡Gracias por tu reseña! Se ha publicado correctamente.
            </p>
          </div>
        )}

        {/* Botón de enviar */}
        <button
          type="submit"
          disabled={loading || rating === 0 || content.trim().length < 10}
          className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-lg ${
            loading || rating === 0 || content.trim().length < 10
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-95"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
              </svg>
              Enviando...
            </span>
          ) : (
            "Publicar Reseña"
          )}
        </button>

        {/* Info del usuario */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Publicando como:{" "}
            <span className="font-semibold text-slate-900">
              {session.user?.name || session.user?.email}
            </span>
          </p>
        </div>
      </form>
    </div>
  )
}

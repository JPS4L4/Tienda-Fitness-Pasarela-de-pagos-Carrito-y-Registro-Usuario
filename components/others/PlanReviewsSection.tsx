"use client";

import { useCallback, useEffect, useState } from "react";
import AddReviewForm from "@/components/others/AddReviewForm";
import { CommentsUI } from "@/app/src/types/comments";
import { CommentsCard } from "@/components/cards/CommentsCard";

interface PlanReviewsSectionProps {
  planId: number;
}

export default function PlanReviewsSection({ planId }: PlanReviewsSectionProps) {
  const [comments, setComments] = useState<CommentsUI[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?planId=${planId}`);
      if (!res.ok) {
        throw new Error("Error al cargar comentarios");
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Formato de comentarios inválido");
      }
      setComments(data);
    } catch (error) {
      console.error(error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return (
    <section className="mt-16 bg-surface-2  p-8 sm:p-10 border border-line">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-fg uppercase tracking-normal mb-3">
          Reseñas del plan
        </h2>
        <p className="text-muted text-lg">
          Comparte tu experiencia si ya compraste este plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <AddReviewForm planId={planId} onReviewAdded={loadComments} />
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-subtle text-center w-full py-8">Cargando reseñas...</div>
          ) : comments.length > 0 ? (
            <div className="flex flex-col gap-4">
              {comments.map((review) => (
                <CommentsCard key={review.id} {...review} />
              ))}
            </div>
          ) : (
            <div className="text-subtle text-center w-full py-8">
              Aún no hay reseñas para este plan.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

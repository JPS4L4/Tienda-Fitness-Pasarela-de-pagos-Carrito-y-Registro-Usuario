import { Review, User } from '@prisma/client';
import { CommentsUI } from '../types/comments';

// Tipo extendido que incluye la relación con User
export type ReviewWithUser = Review & {
  user: User;
};

/**
 * Transforma un Review de Prisma con su usuario a CommentsUI para la interfaz
 */
export function toCommentsUI(review: ReviewWithUser): CommentsUI {
  return {
    id: review.id,
    name: review.user.name || review.user.email?.split('@')[0] || 'Usuario Anónimo',
    role: getRoleFromReview(review),
    content: review.comment || '',
    avatar: review.user.image || undefined,
    rating: review.rating,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

/**
 * Determina el rol/tipo basado en si es review de producto o plan
 */
function getRoleFromReview(review: Review): string {
  if (review.productId) {
    return 'Cliente verificado';
  }
  if (review.planId) {
    return 'Atleta';
  }
  return 'Usuario';
}

/**
 * Transforma un array de Reviews a CommentsUI
 */
export function toCommentsUIList(reviews: ReviewWithUser[]): CommentsUI[] {
  return reviews.map(toCommentsUI);
}

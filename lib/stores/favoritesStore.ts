import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Favorite {
  id: number | string
  type: "product" | "plan"
  title: string
  image?: string
  slug: string
}

interface FavoritesState {
  favorites: Favorite[]
  addFavorite: (item: Favorite) => void
  removeFavorite: (id: number | string, type: "product" | "plan") => void
  isFavorite: (id: number | string, type: "product" | "plan") => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) => {
        const exists = get().favorites.some(
          fav => fav.id === item.id && fav.type === item.type
        )
        if (!exists) {
          set(state => ({
            favorites: [...state.favorites, item]
          }))
        }
      },
      removeFavorite: (id, type) => {
        set(state => ({
          favorites: state.favorites.filter(
            fav => !(fav.id === id && fav.type === type)
          )
        }))
      },
      isFavorite: (id, type) => {
        return get().favorites.some(fav => fav.id === id && fav.type === type)
      },
      clearFavorites: () => set({ favorites: [] })
    }),
    {
      name: "favorites-storage", // nombre en localStorage
      partialize: state => ({ favorites: state.favorites }) // solo guarda favorites
    }
  )
)
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface Favorite {
  id: number | string
  type: "item" | "plan"
  title: string
  image?: string
  slug: string
}

interface FavoritesState {
  favorites: Favorite[]
  setFavorites: (favorites: Favorite[]) => void
  addFavorite: (item: Favorite) => void
  removeFavorite: (id: number | string, type: "item" | "plan") => void
  isFavorite: (id: number | string, type: "item" | "plan") => boolean
  clearFavorites: () => void
}

const USER_KEY_STORAGE = "nan-salazar-user-email"

const getUserKey = () => {
  if (typeof window === "undefined") return "guest"
  return localStorage.getItem(USER_KEY_STORAGE) || "guest"
}

const favoritesStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(`${name}:${getUserKey()}`)
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem(`${name}:${getUserKey()}`, value)
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return
    localStorage.removeItem(`${name}:${getUserKey()}`)
  },
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      setFavorites: (favorites) => set({ favorites }),
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
      storage: createJSONStorage(() => favoritesStorage),
      version: 1,
      partialize: state => ({ favorites: state.favorites }),
      migrate: (persistedState) => {
        const state = persistedState as FavoritesState & { favorites?: any[] }
        const favorites = Array.isArray(state.favorites)
          ? state.favorites.map((fav) => ({
              ...fav,
              type: fav.type === "plan" ? "item" : fav.type,
            }))
          : []
        return { ...state, favorites }
      }
    }
  )
)
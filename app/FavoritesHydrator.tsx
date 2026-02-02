'use client'

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useFavoritesStore } from "@/lib/stores/favoritesStore";

const USER_KEY_STORAGE = "nan-salazar-user-email";
const FAVORITES_STORAGE_KEY = "favorites-storage";
const GUEST_STORAGE_KEY = `${FAVORITES_STORAGE_KEY}:guest`;

export default function FavoritesHydrator() {
  const { data: session, status } = useSession();
  const favorites = useFavoritesStore((state) => state.favorites);
  const setFavorites = useFavoritesStore((state) => state.setFavorites);
  const initializedRef = useRef(false);
  const syncingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    const hydrate = async () => {
      const email = session?.user?.email || "guest";
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY_STORAGE, email);
      }

      useFavoritesStore.persist.rehydrate();

      if (status !== "authenticated") {
        initializedRef.current = true;
        return;
      }

      try {
        const response = await fetch("/api/favorites");
        const data = await response.json();
        if (response.ok && Array.isArray(data.favorites)) {
          setFavorites(data.favorites);
        }

        const guestRaw = typeof window !== "undefined" ? localStorage.getItem(GUEST_STORAGE_KEY) : null;
        const guestParsed = guestRaw ? JSON.parse(guestRaw) : null;
        const guestFavorites = guestParsed?.state?.favorites || [];

        if (guestFavorites.length > 0) {
          syncingRef.current = true;
          await fetch("/api/favorites?merge=true", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favorites: guestFavorites }),
          });
          localStorage.removeItem(GUEST_STORAGE_KEY);

          const refreshed = await fetch("/api/favorites");
          const refreshedData = await refreshed.json();
          if (refreshed.ok && Array.isArray(refreshedData.favorites)) {
            setFavorites(refreshedData.favorites);
          }
        }
      } catch (error) {
        console.error("Error sincronizando favoritos:", error);
      } finally {
        syncingRef.current = false;
        initializedRef.current = true;
      }
    };

    hydrate();
  }, [session?.user?.email, status, setFavorites]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!initializedRef.current || syncingRef.current) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        await fetch("/api/favorites", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favorites }),
        });
      } catch (error) {
        console.error("Error guardando favoritos:", error);
      }
    }, 400);
  }, [favorites, status]);

  return null;
}

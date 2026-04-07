"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type FavoritesContextValue = {
  favorites: Set<string>;
  isFavorited: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  count: number;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const STORAGE_KEY = "aigc_favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

export default function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoritesArr, setFavoritesArr] = useState<string[]>(() => readFavorites());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesArr));
  }, [favoritesArr]);

  const favorites = useMemo(() => new Set(favoritesArr), [favoritesArr]);

  const value = useMemo<FavoritesContextValue>(() => {
    return {
      favorites,
      count: favorites.size,
      isFavorited: (slug: string) => favorites.has(slug),
      toggleFavorite: (slug: string) => {
        setFavoritesArr((prev) => {
          const set = new Set(prev);
          if (set.has(slug)) set.delete(slug);
          else set.add(slug);
          return Array.from(set);
        });
      },
    };
  }, [favorites]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}


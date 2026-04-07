"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type FavoritesContextValue = {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem("aigc-favorites");
    if (!raw) return;
    try {
      setFavorites(JSON.parse(raw));
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("aigc-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const value = useMemo(
    () => ({
      favorites,
      isFavorite: (id: string) => favorites.includes(id),
      toggleFavorite: (id: string) =>
        setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])),
    }),
    [favorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites 必须在 FavoritesProvider 内使用");
  return context;
}

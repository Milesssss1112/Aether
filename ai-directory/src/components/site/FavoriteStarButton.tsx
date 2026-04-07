"use client";

import { useFavorites } from "@/components/site/contexts/FavoritesContext";

export default function FavoriteStarButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(slug);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        favorited
          ? "border-accent/60 bg-accent/15 text-accent"
          : "border-border bg-card text-foreground hover:bg-card-strong/40"
      } ${className ?? ""}`}
      aria-label={favorited ? "取消收藏" : "加入收藏"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mr-2">
        <path
          d="M12 17.3 5.8 20.7l1.1-7-5.1-4.9 7-1 3.1-6.3 3.1 6.3 7 1-5.1 4.9 1.1 7L12 17.3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
          fill={favorited ? "currentColor" : "transparent"}
          opacity={favorited ? 1 : 0.85}
        />
      </svg>
      {favorited ? "已收藏" : "加入收藏"}
    </button>
  );
}


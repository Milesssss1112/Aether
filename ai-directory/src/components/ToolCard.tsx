"use client";

import { motion } from "framer-motion";
import type { ToolItem } from "@/lib/tools";
import { useFavorites } from "@/components/contexts/FavoritesContext";

export default function ToolCard({ tool }: { tool: ToolItem }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favored = isFavorite(tool.id);

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.02, boxShadow: "0 20px 45px rgba(15, 23, 42, 0.55), 0 0 18px rgba(129, 140, 248, 0.35)" }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="glass-panel group relative rounded-2xl p-4"
    >
      <button
        onClick={() => toggleFavorite(tool.id)}
        className="absolute right-3 top-3 rounded-lg bg-slate-950/60 px-2 py-1 text-xs text-amber-300"
      >
        {favored ? "★" : "☆"}
      </button>

      <a href={tool.url} target="_blank" rel="noreferrer" className="block">
        <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 to-violet-500/20 text-xl font-semibold">
          {tool.name.slice(0, 2).toUpperCase()}
        </div>
        <h3 className="text-base font-semibold text-slate-100">{tool.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">{tool.description}</p>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="rounded-md bg-slate-800/80 px-2 py-1 text-slate-300">{tool.category}</span>
          <span className="rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-300">{tool.priceType}</span>
        </div>
      </a>
    </motion.article>
  );
}

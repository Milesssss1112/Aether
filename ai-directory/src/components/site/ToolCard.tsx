"use client";

import { motion } from "framer-motion";
import { formatPricingLabel, getCoverUrl, getLogoUrl, type Tool } from "@/data/tools";
import { categoryNamesBySlug, type ToolCategorySlug } from "@/data/categories";
import { useFavorites } from "@/components/site/contexts/FavoritesContext";
import ToolImage from "@/components/site/ToolImage";

function CategoryChips({ categories }: { categories: Tool["categories"] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="分类标签">
      {categories.slice(0, 2).map((slug) => (
        <span
          key={slug}
          className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted"
        >
          {categoryNamesBySlug[slug as ToolCategorySlug] ?? slug}
        </span>
      ))}
      {categories.length > 2 ? (
        <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted">
          +{categories.length - 2}
        </span>
      ) : null}
    </div>
  );
}

export default function ToolCard({ tool }: { tool: Tool }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const pricing = formatPricingLabel(tool.pricing);
  const favorited = isFavorited(tool.slug);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.03 }}
        whileTap={{ scale: 0.98, rotate: -0.8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="group relative rounded-2xl"
      >
        {/* Clickable overlay for real external navigation */}
        <a
          href={tool.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`打开 ${tool.name} 官网`}
          className="absolute inset-0 z-10 rounded-2xl"
        />

        <div className="relative z-0 overflow-hidden rounded-2xl border border-indigo-300/20 bg-card pointer-events-none transition-all duration-300 group-hover:border-indigo-300/50 group-hover:shadow-[0_0_0_1px_rgba(132,116,255,0.35),0_18px_60px_-20px_rgba(90,92,255,0.8)]">
          <div className="relative aspect-square">
            {/* Use next/image for better performance; coverUrl is svg so it will still work. */}
            <ToolImage
              src={getCoverUrl(tool)}
              alt={`${tool.name} 封面`}
              seed={tool.name}
              variant="cover"
              className="h-full w-full object-cover opacity-95"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(77,129,255,0.05),rgba(163,78,255,0.03))] transition-opacity duration-300 group-hover:opacity-100 opacity-0" />

            <div className="absolute left-4 bottom-4 z-20">
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-border bg-background/40 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.55)]">
                <ToolImage
                  src={getLogoUrl(tool)}
                  alt={`${tool.name} logo`}
                  seed={tool.name}
                  variant="logo"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="absolute left-3 top-3 z-20 pointer-events-none">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${
                  pricing.tone === "free"
                    ? "border-accent/35 bg-accent/10 text-accent"
                    : pricing.tone === "paid"
                      ? "border-amber-400/35 bg-amber-400/10 text-amber-200"
                      : "border-accent2/35 bg-accent2/10 text-accent2"
                }`}
              >
                {pricing.label}
              </span>
            </div>

            <div className="absolute right-3 top-3 z-30 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(tool.slug);
                }}
                aria-label={favorited ? "取消收藏" : "加入收藏"}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card backdrop-blur transition-colors ${
                  favorited ? "border-accent/50 bg-accent/15" : "border-border/80 hover:bg-card-strong/40"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 17.3 5.8 20.7l1.1-7-5.1-4.9 7-1 3.1-6.3 3.1 6.3 7 1-5.1 4.9 1.1 7L12 17.3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                    fill={favorited ? "currentColor" : "transparent"}
                    opacity={favorited ? 1 : 0.85}
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-4 pb-4 pt-4">
            <div className="pointer-events-none">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold leading-snug text-foreground">
                  {tool.name}
                </h3>
              </div>
              <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-muted">
                {tool.description}
              </p>
              <CategoryChips categories={tool.categories} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}


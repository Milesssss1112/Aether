"use client";

import { motion } from "framer-motion";
import { categories, type ToolCategory, type ToolCategorySlug } from "@/data/categories";

export default function CategoryBar({
  active,
  counts,
  onSelect,
}: {
  active: ToolCategorySlug | "all";
  counts: Record<ToolCategorySlug, number>;
  onSelect: (next: ToolCategorySlug | "all") => void;
}) {
  return (
    <div className="sticky top-16 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect("all")}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              active === "all"
                ? "border-accent/60 bg-accent/10 text-accent"
                : "border-border bg-card text-muted hover:text-foreground"
            }`}
          >
            全部 <span className="ml-1 text-xs text-muted">({Object.values(counts).reduce((a, b) => a + b, 0)})</span>
          </button>

          {categories.map((c: ToolCategory) => (
            <motion.button
              key={c.slug}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onSelect(c.slug)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active === c.slug
                  ? "border-accent/60 bg-accent/10 text-accent"
                  : "border-border bg-card text-muted hover:text-foreground"
              }`}
            >
              {c.name}{" "}
              <span className="ml-1 text-xs text-muted">
                ({counts[c.slug] ?? 0})
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}


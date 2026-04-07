"use client";

import { motion } from "framer-motion";
import { starClusters } from "@/lib/tools";

type CategorySectionProps = {
  activeCategory: string;
  onCategorySelect: (category: string) => void;
};

export default function CategorySection({ activeCategory, onCategorySelect }: CategorySectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {starClusters.map((category) => (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(129, 140, 248, 0.45)" }}
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`glass-panel cosmic-border rounded-2xl px-4 py-5 text-left transition duration-300 ease-cosmic ${
              activeCategory === category ? "ring-2 ring-indigo-300/60" : ""
            }`}
          >
            <h3 className="text-breathe text-base font-semibold text-slate-100">{category}</h3>
            <p className="mt-1 text-xs text-slate-400">进入星群，展开对应工具流</p>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

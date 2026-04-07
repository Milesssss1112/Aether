"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import CategorySection from "@/components/CategorySection";
import Hero from "@/components/Hero";
import ToolCard from "@/components/ToolCard";
import { tools } from "@/lib/tools";

type DirectoryHomeProps = {
  initialQuery?: string;
  initialSort?: "hot" | "new" | "name";
  initialPrice?: "all" | "免费" | "付费" | "免费试用";
  initialCategory?: string;
};

export default function DirectoryHome({
  initialQuery = "",
  initialSort = "hot",
  initialPrice = "all",
  initialCategory = "全部",
}: DirectoryHomeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<"hot" | "new" | "name">(initialSort);
  const [priceFilter, setPriceFilter] = useState<"all" | "免费" | "付费" | "免费试用">(initialPrice);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = tools
      .filter((item) => (activeCategory === "全部" ? true : item.category === activeCategory))
      .filter((item) => (priceFilter === "all" ? true : item.priceType === priceFilter))
      .filter((item) => {
        if (!q) return true;
        return [item.name, item.description, item.category, item.tags.join(" ")].join(" ").toLowerCase().includes(q);
      });

    if (sortBy === "hot") result.sort((a, b) => b.hot - a.hot);
    if (sortBy === "new") result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [activeCategory, priceFilter, query, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (sortBy !== "hot") params.set("sort", sortBy);
    if (priceFilter !== "all") params.set("price", priceFilter);
    if (activeCategory !== "全部") params.set("category", activeCategory);
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(url, { scroll: false });
  }, [activeCategory, pathname, priceFilter, query, router, sortBy]);

  return (
    <div>
      <Hero
        query={query}
        setQuery={setQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
      />

      <CategorySection activeCategory={activeCategory} onCategorySelect={(category) => setActiveCategory(category)} />

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="sticky top-[72px] z-20 mb-5 flex items-center justify-between rounded-2xl border border-indigo-300/20 bg-slate-900/70 px-4 py-3 backdrop-blur">
          <p className="text-sm text-slate-200">
            当前分类：<span className="text-indigo-200">{activeCategory}</span>
          </p>
          <button
            className="rounded-lg border border-indigo-300/30 px-3 py-1 text-xs text-slate-200 transition duration-300 ease-cosmic hover:bg-indigo-500/20"
            onClick={() => {
              setActiveCategory("全部");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            返回首屏
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <motion.div key={tool.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

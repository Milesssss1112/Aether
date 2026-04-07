"use client";

import ToolCard from "@/components/ToolCard";
import { useFavorites } from "@/components/contexts/FavoritesContext";
import { tools } from "@/lib/tools";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const list = tools.filter((item) => favorites.includes(item.id));

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-28">
      <h1 className="text-breathe text-3xl font-bold tracking-wider">我的收藏</h1>
      <p className="mt-3 text-slate-300">已收藏工具：{list.length}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}


"use client";

import { useMemo, useState } from "react";
import { tools, type Tool } from "@/data/tools";
import { useFavorites } from "@/components/site/contexts/FavoritesContext";
import ToolCard from "@/components/site/ToolCard";
import Link from "next/link";

type TabKey = "hot" | "favorites";

export default function FavoritesPanel() {
  const { favorites, count } = useFavorites();
  const [tab, setTab] = useState<TabKey>("hot");

  const hotTools = useMemo(() => [...tools].sort((a, b) => b.hotScore - a.hotScore), []);
  const favoriteTools = useMemo(() => tools.filter((t) => favorites.has(t.slug)), [favorites]);

  const list: Tool[] = tab === "hot" ? hotTools.slice(0, 20) : favoriteTools;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold tracking-widest text-muted">HOT / FAVORITES</div>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">热门榜单与收藏</h1>
        <p className="mt-2 text-sm text-muted">热门基于预置热度分数；收藏为本地浏览器保存。</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setTab("hot")}
          className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "hot"
              ? "border-accent/60 bg-accent/10 text-accent"
              : "border-border bg-card text-muted hover:text-foreground"
          }`}
        >
          热门（Top）
        </button>
        <button
          type="button"
          onClick={() => setTab("favorites")}
          className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "favorites"
              ? "border-accent/60 bg-accent/10 text-accent"
              : "border-border bg-card text-muted hover:text-foreground"
          }`}
        >
          收藏（{count}）
        </button>
      </div>

      <div className="mt-6 text-sm text-muted">
        当前：{tab === "hot" ? "热门榜单" : "你的收藏"} · 共{" "}
        <span className="text-foreground font-semibold">{list.length}</span> 个
      </div>

      {tab === "favorites" && count === 0 ? (
        <div className="mt-10 rounded-3xl border border-border bg-card p-8">
          <div className="text-sm font-semibold">还没有收藏内容</div>
          <p className="mt-2 text-sm text-muted">去目录页点击卡片右上角星标，即可加入收藏。</p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            去目录
          </Link>
        </div>
      ) : null}

      {list.length ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      ) : null}
    </div>
  );
}


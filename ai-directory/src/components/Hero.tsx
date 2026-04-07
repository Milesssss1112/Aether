"use client";

import { motion } from "framer-motion";
import { galaxyDomains } from "@/lib/tools";

type HeroProps = {
  query: string;
  setQuery: (value: string) => void;
  sortBy: string;
  setSortBy: (value: "hot" | "new" | "name") => void;
  priceFilter: string;
  setPriceFilter: (value: "all" | "免费" | "付费" | "免费试用") => void;
};

export default function Hero({ query, setQuery, sortBy, setSortBy, priceFilter, setPriceFilter }: HeroProps) {
  return (
    <section className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-28 md:grid-cols-2 md:pt-32">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-breathe text-4xl font-bold tracking-[0.12em] text-slate-50 md:text-6xl"
        >
          AIGC 工具宇宙导航
        </motion.h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
          在深空星云中快速发现优质 AI 工具，覆盖文本创造、视觉生成与开发智能，帮助你构建高效创作与生产力系统。
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {galaxyDomains.map((item) => (
            <div key={item.id} className="glass-panel rounded-2xl p-3">
              <h2 className="text-breathe text-sm font-semibold text-slate-50">{item.name}</h2>
              <p className="mt-1 text-xs text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-5">
        <h3 className="mb-4 text-sm font-semibold text-indigo-100">搜索与筛选</h3>
        <div className="space-y-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索工具名称、标签、描述"
            className="w-full rounded-xl border border-indigo-300/30 bg-slate-900/70 px-4 py-3 text-sm"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "hot" | "new" | "name")}
              className="rounded-xl border border-indigo-300/30 bg-slate-900/70 px-3 py-3 text-sm"
            >
              <option value="hot">按热门</option>
              <option value="new">按最新</option>
              <option value="name">按字母</option>
            </select>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as "all" | "免费" | "付费" | "免费试用")}
              className="rounded-xl border border-indigo-300/30 bg-slate-900/70 px-3 py-3 text-sm"
            >
              <option value="all">全部价格</option>
              <option value="免费">免费</option>
              <option value="免费试用">免费试用</option>
              <option value="付费">付费</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

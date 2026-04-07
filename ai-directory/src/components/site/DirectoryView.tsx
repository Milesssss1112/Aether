"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Tool } from "@/data/tools";
import type { ToolCategorySlug } from "@/data/categories";
import { categories as categoryList } from "@/data/categories";
import CategoryBar from "@/components/site/CategoryBar";
import ToolCard from "@/components/site/ToolCard";
import { formatPricingLabel, type ToolPricing } from "@/data/tools";
import { motion, useScroll, useTransform } from "framer-motion";
import LogoCarousel from "@/components/site/LogoCarousel";
import BottomSectionDock from "@/components/site/BottomSectionDock";

type SortKey = "hot" | "new" | "name";
type FloatingSector = {
  id: string;
  title: string;
  desc: string;
  x: string;
  y: string;
  category: ToolCategorySlug;
};

export default function DirectoryView({
  tools,
  initial,
}: {
  tools: Tool[];
  initial: {
    q?: string;
    category?: ToolCategorySlug | "all";
    sort?: SortKey;
    pricing?: ToolPricing | "all";
  };
}) {
  const router = useRouter();

  const [q, setQ] = useState(initial.q ?? "");
  const [category, setCategory] = useState<ToolCategorySlug | "all">(initial.category ?? "all");
  const [sort, setSort] = useState<SortKey>(initial.sort ?? "hot");
  const [pricing, setPricing] = useState<ToolPricing | "all">(initial.pricing ?? "all");
  const [hoverSection, setHoverSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<ToolCategorySlug | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroFlowY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroFlowOpacity = useTransform(scrollYProgress, [0, 1], [0.42, 0.05]);

  const floatingSections = useMemo<FloatingSector[]>(
    () => [
      { id: "s-writing", title: "AI写作", desc: "写作与内容生成", x: "7%", y: "18%", category: "writing" },
      { id: "s-drawing", title: "AI绘画", desc: "绘画与图像生成", x: "28%", y: "8%", category: "drawing" },
      { id: "s-video", title: "AI视频", desc: "视频生成与剪辑", x: "52%", y: "16%", category: "video" },
      { id: "s-coding", title: "AI代码", desc: "编程与开发辅助", x: "76%", y: "10%", category: "coding" },
      { id: "s-audio", title: "AI音频", desc: "音频与语音合成", x: "13%", y: "60%", category: "audio" },
      { id: "s-design", title: "AI设计", desc: "视觉设计与品牌", x: "36%", y: "66%", category: "design" },
      { id: "s-office", title: "AI办公", desc: "办公效率自动化", x: "58%", y: "64%", category: "office" },
      { id: "s-data", title: "AI数据", desc: "检索分析与洞察", x: "80%", y: "60%", category: "data" },
    ],
    []
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (category !== "all") params.set("category", category);
      if (pricing !== "all") params.set("pricing", pricing);
      if (sort !== "hot") params.set("sort", sort);
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : `/`);
    }, 350);
    return () => window.clearTimeout(t);
  }, [q, category, pricing, sort, router]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 14;
      setParallax({ x, y });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const counts = useMemo(() => {
    const map = Object.fromEntries(categoryList.map((c) => [c.slug, 0])) as Record<ToolCategorySlug, number>;
    for (const t of tools) {
      for (const c of t.categories) map[c] = (map[c] ?? 0) + 1;
    }
    return map;
  }, [tools]);

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    const list = tools.filter((t) => {
      if (category !== "all" && !t.categories.includes(category)) return false;
      if (pricing !== "all" && t.pricing !== pricing) return false;
      if (!nq) return true;
      const hay = `${t.name} ${t.description} ${t.tags.join(" ")} ${t.categories.join(" ")}`.toLowerCase();
      return hay.includes(nq);
    });

    const bySort = [...list];
    if (sort === "hot") bySort.sort((a, b) => b.hotScore - a.hotScore);
    if (sort === "new") bySort.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    if (sort === "name") bySort.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));

    return bySort;
  }, [tools, q, category, pricing, sort]);

  const expandedTools = useMemo(() => {
    if (!expandedCategory) return [];
    return tools
      .filter((t) => t.categories.includes(expandedCategory))
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, 8);
  }, [expandedCategory, tools]);

  const scrollToDirectory = () => {
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const expandSector = (sector: FloatingSector) => {
    setActiveSection(sector.id);
    setExpandedCategory(sector.category);
    setCategory(sector.category);
    setTimeout(() => {
      scrollToDirectory();
    }, 120);
  };

  const resetToHomeLayout = () => {
    setQ("");
    setCategory("all");
    setSort("hot");
    setPricing("all");
    setHoverSection(null);
    setActiveSection(null);
    setExpandedCategory(null);
  };

  return (
    <div>
      <section ref={heroRef} id="hero" className="relative mx-auto min-h-[92vh] max-w-7xl px-4 pb-10 pt-8 sm:px-6">
        <motion.div
          style={{ y: heroFlowY, opacity: heroFlowOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[-130px] z-0 h-72 bg-[radial-gradient(ellipse_at_center,rgba(113,110,255,0.42),rgba(30,35,70,0)_72%)] blur-xl"
        />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest text-indigo-200/80">COSMIC DIRECTORY</div>
            <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">
              AIGC 工具宇宙导航
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              深色科幻风 + 粒子星空背景。快速筛选、搜索与排序，卡片支持真实外链跳转。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索：工具名、标签、描述…"
                className="w-[320px] max-w-[82vw] rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent outline-none"
                aria-label="目录搜索"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-muted" htmlFor="sortSelect">
                排序
              </label>
              <select
                id="sortSelect"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-2xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-accent outline-none"
                aria-label="排序"
              >
                <option value="hot">热门</option>
                <option value="new">最新</option>
                <option value="name">名称</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-muted" htmlFor="pricingSelect">
                价格
              </label>
              <select
                id="pricingSelect"
                value={pricing}
                onChange={(e) => setPricing(e.target.value as ToolPricing | "all")}
                className="rounded-2xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-accent outline-none"
                aria-label="价格筛选"
              >
                <option value="all">全部</option>
                <option value="free">{formatPricingLabel("free").label}</option>
                <option value="freemium">{formatPricingLabel("freemium").label}</option>
                <option value="paid">{formatPricingLabel("paid").label}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-sm text-muted">
            结果：<span className="text-foreground font-semibold">{filtered.length}</span> / {tools.length}
          </div>
          <div className="text-sm text-muted">
            当前分类：{" "}
            <span className="text-foreground font-semibold">
              {category === "all" ? "全部" : categoryList.find((c) => c.slug === category)?.name ?? category}
            </span>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { id: "writing", title: "文本创造域", desc: "写作、办公、知识工作流" },
            { id: "visual", title: "视觉生成域", desc: "绘画、设计、视频生成" },
            { id: "dev", title: "开发智能域", desc: "代码、数据、自动化流程" },
          ].map((item) => {
            const dimmed = hoverSection && hoverSection !== item.id;
            return (
              <motion.div
                key={item.id}
                onHoverStart={() => setHoverSection(item.id)}
                onHoverEnd={() => setHoverSection(null)}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`rounded-2xl border border-indigo-300/20 bg-[linear-gradient(120deg,rgba(39,56,106,0.38),rgba(91,56,160,0.22))] p-4 transition-opacity ${
                  dimmed ? "opacity-35" : "opacity-100"
                }`}
              >
                <div className="text-sm font-semibold">{item.title}</div>
                <p className="mt-1 text-xs text-muted">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="relative mt-8 min-h-[460px] overflow-hidden rounded-3xl border border-border bg-card/25"
          animate={{ y: parallax.y * 0.35, x: parallax.x * 0.35 }}
          transition={{ type: "spring", stiffness: 30, damping: 20, mass: 1.2 }}
        >
          <div className="absolute inset-0 cosmic-grid opacity-60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(76,141,255,0.28),transparent_40%),radial-gradient(circle_at_80%_15%,rgba(139,92,246,0.24),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(24,200,255,0.2),transparent_42%)]" />
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(10,10,20,0.95),rgba(10,10,20,0.65)_45%,rgba(76,141,255,0.1)_70%,transparent_76%)] shadow-[0_0_120px_rgba(76,141,255,0.35)]"
            animate={{ rotate: 360, scale: [1, 1.06, 1] }}
            transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
          />
          <div className="absolute left-5 top-5 z-20 rounded-full border border-border bg-black/25 px-3 py-1 text-xs text-indigo-100/90">
            星云分区 · 点击展开工具列表
          </div>
          {floatingSections.map((section) => {
            const dimmed = hoverSection && hoverSection !== section.id;
            const isActive = activeSection === section.id;
            return (
              <motion.button
                key={section.id}
                type="button"
                onHoverStart={() => setHoverSection(section.id)}
                onHoverEnd={() => setHoverSection(null)}
                onClick={() => expandSector(section)}
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  rotate: isActive ? 2 : 0,
                  opacity: dimmed ? 0.35 : 1,
                  y: isActive ? -6 : [0, -6, 0],
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 1.14, rotate: 7 }}
                transition={{
                  duration: 0.22,
                  ease: [0.16, 1, 0.3, 1],
                  y: { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: Number(section.x.replace("%", "")) / 20 },
                }}
                className="absolute z-10 rounded-2xl border border-indigo-200/30 bg-[linear-gradient(135deg,rgba(14,18,35,0.82),rgba(44,32,89,0.7))] px-4 py-3 text-left shadow-[0_30px_80px_-30px_rgba(76,141,255,0.55)] backdrop-blur transition-shadow hover:shadow-[0_0_50px_rgba(122,137,255,0.78)]"
                style={{ left: section.x, top: section.y }}
              >
                <div className="text-sm font-semibold text-indigo-100">{section.title}</div>
                <div className="mt-1 text-xs text-indigo-100/75">{section.desc}</div>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: expandedCategory ? 1 : 0, height: expandedCategory ? "auto" : 0, marginTop: expandedCategory ? 16 : 0 }}
          className="overflow-hidden rounded-2xl border border-indigo-300/20 bg-black/25"
        >
          {expandedCategory ? (
            <div className="p-4">
              <div className="mb-3 text-sm font-semibold text-indigo-100">
                已展开：{categoryList.find((c) => c.slug === expandedCategory)?.name ?? expandedCategory} · 热门工具预览
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {expandedTools.map((tool) => (
                  <button
                    key={tool.slug}
                    type="button"
                    onClick={() => {
                      setQ(tool.name);
                      scrollToDirectory();
                    }}
                    className="rounded-xl border border-border bg-card/50 px-3 py-2 text-left text-xs text-indigo-100/90 transition-colors hover:bg-indigo-500/20"
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>

        <motion.div
          className="mt-6 flex items-center justify-center text-xs text-indigo-100/80"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <button
            type="button"
            onClick={scrollToDirectory}
            className="rounded-full border border-indigo-300/30 bg-black/25 px-4 py-2 hover:bg-black/35 transition-colors"
          >
            向下探索工具宇宙 ↓
          </button>
        </motion.div>
      </section>

      <section id="logos" className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6">
        <LogoCarousel tools={tools} />
      </section>

      <CategoryBar
        active={category}
        counts={counts}
        onSelect={(next) => setCategory(next)}
      />

      <section id="directory" className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">
        <motion.div
          layout
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </motion.div>
      </section>
      <BottomSectionDock onBackHome={resetToHomeLayout} />
    </div>
  );
}


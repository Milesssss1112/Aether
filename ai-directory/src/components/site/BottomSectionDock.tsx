"use client";

import { useMemo, useState } from "react";

const sections = [
  { id: "hero", label: "首屏" },
  { id: "logos", label: "Logo 轮播" },
  { id: "directory", label: "工具目录" },
];

export default function BottomSectionDock({ onBackHome }: { onBackHome?: () => void }) {
  const [active, setActive] = useState("hero");

  const items = useMemo(() => sections, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-card/80 px-2 py-2 backdrop-blur">
      <div className="flex items-center gap-1">
        {items.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
              active === s.id ? "bg-accent text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            onBackHome?.();
            scrollTo("hero");
          }}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}


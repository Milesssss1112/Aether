"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/site/contexts/ThemeContext";
import { useFavorites } from "@/components/site/contexts/FavoritesContext";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { count } = useFavorites();

  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // If user is already on the home page with a query, keep the input in sync.
  const placeholder = useMemo(() => {
    if (pathname === "/") return "搜索工具（名称 / 标签 / 描述）…";
    return "搜索并跳转目录…";
  }, [pathname]);

  const submitSearch = (value: string) => {
    const nextQ = value.trim();
    if (!nextQ) {
      router.push("/");
      return;
    }
    router.push(`/?q=${encodeURIComponent(nextQ)}`);
  };

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/40 transition-colors ${
        scrolled ? "bg-background/80 border-border/60" : "bg-background/35 border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="group flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card-strong/60">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            <span className="hidden text-sm font-semibold tracking-wide sm:inline">
              AIGC Tools
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="主导航">
            <Link className="text-sm text-muted hover:text-foreground transition-colors" href="/">
              目录
            </Link>
            <Link className="text-sm text-muted hover:text-foreground transition-colors" href="/categories">
              分类
            </Link>
            <Link className="text-sm text-muted hover:text-foreground transition-colors" href="/favorites">
              热门/收藏
            </Link>
            <Link className="text-sm text-muted hover:text-foreground transition-colors" href="/submit">
              提交工具
            </Link>
            <Link className="text-sm text-muted hover:text-foreground transition-colors" href="/about">
              关于
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <form
            className="hidden items-center gap-2 md:flex"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(q);
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="w-[340px] rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent outline-none"
              aria-label="搜索"
            />
            <button
              type="submit"
              className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:opacity-95 transition-opacity"
            >
              搜索
            </button>
          </form>

          <button
            type="button"
            onClick={() => toggleTheme()}
            className="group inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card hover:bg-card-strong/40 transition-colors"
            aria-label="切换夜间模式"
            title="切换夜间模式"
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 2v2.4M12 19.6V22M22 12h-2.4M4.4 12H2M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7M19.1 19.1l-1.7-1.7M6.6 6.6 4.9 4.9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M21 14.7A8.6 8.6 0 0 1 9.3 3a7 7 0 1 0 11.7 11.7Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          <Link
            href="/favorites"
            className="relative hidden h-10 items-center justify-center rounded-2xl border border-border bg-card px-3 text-sm text-muted hover:text-foreground md:inline-flex"
            aria-label="查看热门与收藏"
          >
            热门
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-white">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}


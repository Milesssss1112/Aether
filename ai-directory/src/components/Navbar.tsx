"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useFavorites } from "@/components/contexts/FavoritesContext";
import { useTheme } from "@/components/contexts/ThemeContext";

const navItems = [
  { label: "目录", href: "/" },
  { label: "分类", href: "/categories" },
  { label: "热门", href: "/popular" },
  { label: "提交工具", href: "/submit" },
  { label: "关于", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const { favorites } = useFavorites();
  const { darkMode, toggleTheme } = useTheme();

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = keyword.trim();
    const url = query ? `/?q=${encodeURIComponent(query)}` : "/";
    router.push(url);
  };

  return (
    <header className="fixed top-0 z-40 w-full border-b border-indigo-400/20 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-[0.2em] text-slate-100 md:text-base">
          AIGC Tools
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative text-sm transition-colors duration-300 ease-cosmic ${
                pathname === item.href ? "text-indigo-200" : "text-slate-300 hover:text-indigo-200"
              }`}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden md:block">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索工具..."
            className="w-52 rounded-xl border border-indigo-300/30 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
          />
        </form>

        <button
          onClick={toggleTheme}
          className="rounded-xl border border-indigo-300/30 bg-slate-900/70 px-3 py-2 text-xs text-slate-200 transition duration-300 ease-cosmic hover:text-indigo-200"
        >
          {darkMode ? "夜间" : "日间"}
        </button>

        <Link
          href="/favorites"
          className="rounded-xl border border-indigo-300/30 bg-slate-900/70 px-3 py-2 text-xs text-slate-200 transition duration-300 ease-cosmic hover:text-indigo-200"
        >
          收藏 {favorites.length}
        </Link>
      </div>
    </header>
  );
}

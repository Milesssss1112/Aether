import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-lg">
            <div className="text-sm font-semibold">AIGC Tools Directory</div>
            <p className="mt-2 text-sm text-muted">
              收录导航站点：专注体验与真实外链。分类/搜索/排序均可在前端即时交互。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Link className="text-muted hover:text-foreground transition-colors" href="/">
              目录
            </Link>
            <Link className="text-muted hover:text-foreground transition-colors" href="/categories">
              分类
            </Link>
            <Link className="text-muted hover:text-foreground transition-colors" href="/favorites">
              热门/收藏
            </Link>
            <Link className="text-muted hover:text-foreground transition-colors" href="/submit">
              提交工具
            </Link>
            <Link className="text-muted hover:text-foreground transition-colors" href="/about">
              关于本站
            </Link>
            <Link className="text-muted hover:text-foreground transition-colors" href="/contact">
              联系/免责声明
            </Link>
          </div>
        </div>

        <div className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} AIGC Tools Directory. All rights reserved.
        </div>
      </div>
    </footer>
  );
}


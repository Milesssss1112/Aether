import Link from "next/link";
import { starClusters } from "@/lib/tools";

export default function CategoriesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-28">
      <h1 className="text-breathe text-3xl font-bold tracking-wider">分类星图</h1>
      <p className="mt-3 text-slate-300">按星群浏览全部工具分类。</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {starClusters.map((item) => (
          <Link key={item} href={`/?category=${encodeURIComponent(item)}`} className="glass-panel rounded-2xl p-4 transition hover:shadow-glow">
            <h2 className="font-semibold">{item}</h2>
            <p className="mt-2 text-sm text-slate-400">查看该分类下的工具</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

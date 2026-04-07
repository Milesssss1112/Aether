import ToolCard from "@/components/ToolCard";
import { tools } from "@/lib/tools";

export default function PopularPage() {
  const list = [...tools].sort((a, b) => b.hot - a.hot).slice(0, 9);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-28">
      <h1 className="text-breathe text-3xl font-bold tracking-wider">热门工具</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

import { notFound } from "next/navigation";
import { tools } from "@/lib/tools";

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = tools.find((item) => item.id === slug);
  if (!tool) notFound();

  return (
    <section className="mx-auto max-w-4xl px-4 pb-20 pt-28">
      <h1 className="text-breathe text-4xl font-bold tracking-wider">{tool.name}</h1>
      <p className="mt-4 text-slate-300">{tool.description}</p>
      <div className="glass-panel mt-8 rounded-3xl p-6">
        <p>分类：{tool.category}</p>
        <p className="mt-2">价格：{tool.priceType}</p>
        <a href={tool.url} target="_blank" rel="noreferrer" className="mt-5 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2">
          前往官网
        </a>
      </div>
    </section>
  );
}


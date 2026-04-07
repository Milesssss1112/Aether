import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-20 pt-28">
      <h1 className="text-breathe text-3xl font-bold tracking-wider">关于本站</h1>
      <p className="mt-4 leading-8 text-slate-300">
        这是一个以宇宙星空科技风呈现的 AIGC 工具导航网站，专注让用户在沉浸视觉中快速完成发现、筛选与访问。
      </p>
      <div className="glass-panel mt-8 rounded-3xl p-6">
        <p className="text-slate-200">技术栈：Next.js App Router + Tailwind CSS v3 + Framer Motion + tsparticles。</p>
      </div>
      <Link href="/submit" className="mt-6 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold">
        提交新工具
      </Link>
    </section>
  );
}

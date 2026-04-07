"use client";

import { useMemo, useState } from "react";
import { categories, type ToolCategorySlug } from "@/data/categories";
import { type ToolPricing } from "@/data/tools";
import { useRouter } from "next/navigation";

type FormState = {
  name: string;
  url: string;
  description: string;
  categories: ToolCategorySlug[];
  tags: string;
  pricing: ToolPricing;
};

export default function SubmitForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    url: "",
    description: "",
    categories: [],
    tags: "",
    pricing: "freemium",
  });

  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [msg, setMsg] = useState<string>("");

  const cats = useMemo(() => categories, []);

  const toggleCat = (slug: ToolCategorySlug) => {
    setForm((prev) => {
      const exists = prev.categories.includes(slug);
      const nextCats = exists ? prev.categories.filter((c) => c !== slug) : [...prev.categories, slug];
      return { ...prev, categories: nextCats };
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    const url = form.url.trim();
    const description = form.description.trim();

    if (!name || name.length < 2) {
      setStatus("error");
      setMsg("请输入工具名称（至少 2 个字符）。");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setStatus("error");
      setMsg("请输入以 http/https 开头的官方链接。");
      return;
    }
    if (!description || description.length < 10) {
      setStatus("error");
      setMsg("请填写更完整的描述（至少 10 个字符）。");
      return;
    }
    if (form.categories.length === 0) {
      setStatus("error");
      setMsg("请选择至少一个分类。");
      return;
    }

    const rawTags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);

    const submission = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      createdAt: new Date().toISOString(),
      payload: {
        name,
        url,
        description,
        categories: form.categories,
        tags: rawTags,
        pricing: form.pricing,
      },
    };

    try {
      const key = "aigc_submissions";
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
      const next = Array.isArray(existing) ? [...existing, submission] : [submission];
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore storage issues
    }

    setStatus("ok");
    setMsg("提交成功！已保存在本地（演示版），后续可对接真实审核流程。");

    setForm({
      name: "",
      url: "",
      description: "",
      categories: [],
      tags: "",
      pricing: "freemium",
    });

    setTimeout(() => router.push("/"), 1200);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
      <div className="text-xs font-semibold tracking-widest text-muted">SUBMIT</div>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">提交工具</h1>
      <p className="mt-2 text-sm text-muted">
        这是一个前端演示表单：提交内容会保存到你本地浏览器（方便测试 UI/交互）。你可以后续接入真实后端。
      </p>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold" htmlFor="name">
              工具名称
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-border bg-background/40 px-4 py-2 text-sm outline-none focus:border-accent"
              placeholder="例如：Awesome AI Tool"
            />
          </div>

          <div>
            <label className="text-sm font-semibold" htmlFor="url">
              官方链接（必填）
            </label>
            <input
              id="url"
              value={form.url}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-border bg-background/40 px-4 py-2 text-sm outline-none focus:border-accent"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold" htmlFor="desc">
              简短描述
            </label>
            <textarea
              id="desc"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-border bg-background/40 px-4 py-2 text-sm outline-none focus:border-accent"
              placeholder="一句话讲清楚：它做什么、适合谁"
            />
          </div>

          <div>
            <div className="text-sm font-semibold">分类（必选）</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {cats.map((c) => {
                const checked = form.categories.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggleCat(c.slug)}
                    className={`rounded-2xl border px-3 py-2 text-sm transition-colors ${
                      checked
                        ? "border-accent/70 bg-accent/15 text-accent"
                        : "border-border bg-card text-muted hover:text-foreground"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="pricing">
                价格标识
              </label>
              <select
                id="pricing"
                value={form.pricing}
                onChange={(e) => setForm((prev) => ({ ...prev, pricing: e.target.value as ToolPricing }))}
                className="mt-2 w-full rounded-2xl border border-border bg-background/40 px-4 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="free">免费</option>
                <option value="freemium">免费/付费</option>
                <option value="paid">付费</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold" htmlFor="tags">
                标签（逗号分隔）
              </label>
              <input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-border bg-background/40 px-4 py-2 text-sm outline-none focus:border-accent"
                placeholder="例如：写作, 润色, 模板"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
          >
            提交收录
          </button>

          {status !== "idle" ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                status === "ok"
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-amber-300/40 bg-amber-300/10 text-amber-200"
              }`}
              role="status"
              aria-live="polite"
            >
              {msg}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}


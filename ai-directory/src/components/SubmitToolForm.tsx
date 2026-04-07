"use client";

import { FormEvent, useState } from "react";

export default function SubmitToolForm() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, description }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setMessage(data.message ?? "提交失败，请稍后再试。");
      } else {
        setMessage("提交成功，已进入待审核队列。");
        setName("");
        setUrl("");
        setDescription("");
      }
    } catch {
      setMessage("网络异常，请检查连接后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="glass-panel mt-8 space-y-4 rounded-3xl p-6">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-indigo-300/30 bg-slate-900/70 px-4 py-3"
        placeholder="工具名称"
        required
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        type="url"
        className="w-full rounded-xl border border-indigo-300/30 bg-slate-900/70 px-4 py-3"
        placeholder="官网链接"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-xl border border-indigo-300/30 bg-slate-900/70 px-4 py-3"
        rows={4}
        placeholder="工具描述"
        required
      />
      <button
        disabled={isSubmitting}
        className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 transition duration-300 ease-cosmic hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "提交中..." : "提交审核"}
      </button>
      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}

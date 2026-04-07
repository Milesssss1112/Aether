/**
 * 创作目标 → 工具推荐（规则 + 可选唤起 AI 浮窗）
 * 依赖：tools.js 已加载 AIGC_TOOLS
 */
(function () {
  const form = document.getElementById("recommendForm");
  const out = document.getElementById("recommendResults");
  if (!form || !out) return;

  /** @type {Record<string, { label: string; toolIds: string[]; tips: string }>} */
  const GOALS = {
    poster_text: {
      label: "海报 / 主视觉（画面内需要清晰文字）",
      toolIds: ["ideogram", "midjourney", "leonardo"],
      tips: "优先用擅长排版的生成工具；标题原文写进提示词，并预留安全边距便于印刷裁切。",
    },
    image_art: {
      label: "艺术插画 / 概念图（不要求内嵌大段文字）",
      toolIds: ["midjourney", "leonardo", "krea"],
      tips: "用参考图或风格词锁定画风；多轮只改一个变量（光影/镜头/色调）。",
    },
    video_short: {
      label: "短视频 / 动态镜头",
      toolIds: ["runway", "pika", "luma"],
      tips: "先写分镜表再生成；首尾镜头风格对齐后再批量中间镜头。",
    },
    writing_long: {
      label: "长文 / 报告 / 方案",
      toolIds: ["claude", "chatgpt", "perplexity"],
      tips: "大纲确认后再分章节扩写；事实与数据需单独检索核对。",
    },
    code_project: {
      label: "代码 / 原型 / Agent 工作流",
      toolIds: ["cursor", "github-copilot", "v0"],
      tips: "说明技术栈与约束；小步提交与测试，避免一次生成过大 diff。",
    },
    voice_audio: {
      label: "配音 / 播客 / 语音克隆",
      toolIds: ["elevenlabs", "descript", "adobe-podcast"],
      tips: "统一采样率与响度；口误用文本轴剪辑比反复重录更高效。",
    },
    music: {
      label: "音乐 / 歌曲灵感",
      toolIds: ["suno", "elevenlabs"],
      tips: "先定 BPM 与情绪，再补乐器；成品注意平台版权政策。",
    },
    research: {
      label: "检索 / 综述 / 竞品资料",
      toolIds: ["perplexity", "chatgpt", "claude"],
      tips: "需要引用时优先用带来源的搜索型助手，再人工核对关键结论。",
    },
  };

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function allTools() {
    return window.AIGC_TOOLS || [];
  }

  function pickTools(goalKey, level, extraRaw) {
    const base = GOALS[goalKey];
    if (!base) return { picks: [], tips: "", label: "" };
    const extra = String(extraRaw || "").toLowerCase();
    let ids = [...base.toolIds];

    if (extra.includes("中文") || extra.includes("小说") || extra.includes("长文")) {
      if (!ids.includes("deepseek")) ids.push("deepseek");
    }
    if (extra.includes("开源") || extra.includes("模型")) {
      if (!ids.includes("huggingface")) ids.push("huggingface");
    }
    if (extra.includes("api") || extra.includes("部署")) {
      if (!ids.includes("replicate")) ids.push("replicate");
    }

    const seen = new Set();
    ids = ids.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const list = allTools();
    const picks = [];
    for (const id of ids) {
      const t = list.find((x) => x.id === id);
      if (t) picks.push(t);
      if (picks.length >= 5) break;
    }

    let tips = base.tips;
    if (level === "beginner") tips += " 入门建议：先各工具试一条默认模板，再对照教程调参。";
    if (level === "advanced") tips += " 进阶：可串联「生成 + 后期」工具，并固定自己的提示词模板库。";

    return { picks, tips, label: base.label };
  }

  function renderPicks({ picks, tips, label }) {
    if (!picks.length) {
      out.innerHTML = `<p class="text-sm text-neutral-500">未匹配到工具数据，请确认已加载 tools.js。</p>`;
      return;
    }
    const cards = picks
      .map((t) => {
        const hrefFn = window.AETHER_TOOL_PAGE_HREF || ((id) => "tool.html?id=" + encodeURIComponent(id));
        const href = hrefFn(t.id);
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="group flex gap-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 bg-white/70 dark:bg-neutral-950/40 hover:border-indigo-300/50 dark:hover:border-indigo-500/30 transition-colors">
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold text-black dark:text-white group-hover:underline">${escapeHtml(t.name)}</div>
            <div class="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">${escapeHtml(t.tagline || "")}</div>
          </div>
          <span class="text-neutral-400 text-lg shrink-0" aria-hidden="true">↗</span>
        </a>`;
      })
      .join("");
    out.innerHTML = `
      <div class="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 p-5 sm:p-6">
        <p class="text-xs font-semibold font-bricolage text-indigo-600 dark:text-indigo-400 uppercase tracking-wider inline-flex items-center gap-1"><span class="material-symbols-outlined text-base align-middle" aria-hidden="true">layers</span>推荐组合</p>
        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-300">${escapeHtml(label)}</p>
        <div class="mt-5 grid gap-3">${cards}</div>
        <p class="mt-6 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-200/60 dark:border-neutral-800 pt-5">${escapeHtml(tips)}</p>
      </div>`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const goal = document.getElementById("recGoal")?.value || "research";
    const level = document.getElementById("recLevel")?.value || "beginner";
    const extra = document.getElementById("recExtra")?.value || "";
    const result = pickTools(goal, level, extra);
    renderPicks(result);
  });

  document.getElementById("recAskAi")?.addEventListener("click", () => {
    const goal = document.getElementById("recGoal");
    const level = document.getElementById("recLevel");
    const extra = document.getElementById("recExtra");
    const gk = goal?.value || "research";
    const gl = GOALS[gk]?.label || gk;
    const text = [
      "我在使用 Aether 创作工作台，请根据以下信息推荐工具组合并给出简短工作流步骤：",
      `目标类型：${gl}`,
      `经验：${level?.value === "advanced" ? "有经验" : "入门"}`,
      extra?.value?.trim() ? `补充：${extra.value.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const panel = document.getElementById("aiPanel");
    const input = document.getElementById("aiInput");
    const fab = document.getElementById("aiFab");
    if (panel) panel.classList.remove("hidden");
    if (input) input.value = text;
    fab?.focus();
  });
})();

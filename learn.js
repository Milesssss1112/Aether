/**
 * 教程 / 案例列表与详情（数据源：data/learn-content.json）
 */
(function () {
  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toolById(id) {
    const list = window.AIGC_TOOLS || [];
    return list.find((t) => t.id === id);
  }

  async function loadData() {
    // http(s) 下优先读 JSON，便于只改文件不重建 learn-content.js
    try {
      const timestamp = Date.now();
      const res = await fetch(`./data/learn-content.json?v=${timestamp}`);
      if (res.ok) return await res.json();
    } catch (_) {
      /* file:// 等环境 fetch 常失败 */
    }
    if (window.AETHER_LEARN_CONTENT && Array.isArray(window.AETHER_LEARN_CONTENT.articles)) {
      return window.AETHER_LEARN_CONTENT;
    }
    throw new Error(
      "无法加载教程数据。请确认存在 data/learn-content.json；若用 file:// 打开，请保留 learn-content.js 并在 learn.html 中先于 learn.js 引入。"
    );
  }

  function renderRelated(ids) {
    if (!ids || !ids.length) return "";
    const cats = window.AIGC_CATEGORIES || [];
    const items = ids
      .map((id) => {
        const t = toolById(id);
        if (!t) return "";
        const cat = cats.find((c) => c.id === t.category);
        const hrefFn = window.AETHER_TOOL_PAGE_HREF || ((id) => "tool.html?id=" + encodeURIComponent(id));
        const thref = hrefFn(t.id);
        return `<a href="${thref.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between gap-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
          <span class="text-sm font-medium text-black dark:text-white">${escapeHtml(t.name)}</span>
          <span class="text-xs text-neutral-500">${escapeHtml(cat ? cat.label : "")}</span>
        </a>`;
      })
      .filter(Boolean);
    if (!items.length) return "";
    return `<div class="mt-10"><h2 class="text-sm font-semibold font-bricolage text-black dark:text-white mb-3 inline-flex items-center gap-1"><span class="material-symbols-outlined text-base" aria-hidden="true">link</span>相关工具</h2><div class="grid sm:grid-cols-2 gap-2">${items.join("")}</div></div>`;
  }

  function renderArticle(data, slug) {
    const mount = document.getElementById("articleMount");
    if (!mount) return;
    const a = (data.articles || []).find((x) => x.slug === slug);
    if (!a) {
      mount.innerHTML = `<p class="text-neutral-600 dark:text-neutral-400">未找到该内容。</p><a href="./learn.html" class="inline-block mt-4 text-sm text-indigo-600 dark:text-indigo-400">返回学习区</a>`;
      return;
    }
    const typeLabel = a.type === "case" ? "案例" : "教程";
    const steps =
      (a.steps || [])
        .map(
          (s, i) =>
            `<li class="border-b border-neutral-200/70 dark:border-neutral-800 pb-6 last:border-0">
            <div class="flex gap-3">
              <span class="shrink-0 h-8 w-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-sm font-semibold flex items-center justify-center">${i + 1}</span>
              <div>
                <h3 class="text-base font-semibold font-bricolage text-black dark:text-white">${escapeHtml(s.title)}</h3>
                <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">${escapeHtml(s.body)}</p>
              </div>
            </div>
          </li>`
        )
        .join("") || "";
    const cover = a.cover
      ? `<img src="${escapeHtml(a.cover)}" alt="" class="w-full max-h-[420px] object-cover rounded-2xl border border-neutral-200/70 dark:border-neutral-800" />`
      : "";
    const tags = (a.tags || []).map((t) => `<span class="text-xs px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">${escapeHtml(t)}</span>`).join(" ");

    mount.innerHTML = `
      <p class="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">${typeLabel}</p>
      <h1 class="mt-2 text-3xl sm:text-4xl font-semibold text-black dark:text-white font-bricolage leading-tight">${escapeHtml(a.title)}</h1>
      <p class="mt-4 text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">${escapeHtml(a.summary || "")}</p>
      <div class="mt-4 flex flex-wrap gap-2">${tags}</div>
      <div class="mt-8">${cover}</div>
      <ol class="mt-10 space-y-6 list-none p-0 m-0">${steps}</ol>
      ${renderRelated(a.relatedToolIds)}
    `;
    const t = document.getElementById("articleTitle");
    if (t) t.textContent = a.title;
  }

  function renderList(data) {
    const mount = document.getElementById("learnListMount");
    if (!mount) return;
    let filter = "all";
    const articles = data.articles || [];

    function paint() {
      const list = filter === "all" ? articles : articles.filter((x) => x.type === filter);
      mount.innerHTML = list
        .map((a) => {
          const typeLabel = a.type === "case" ? "案例" : "教程";
          const cover = a.cover
            ? `<div class="aspect-[16/10] overflow-hidden"><img src="${escapeHtml(a.cover)}" alt="" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" /></div>`
            : `<div class="aspect-[16/10] bg-neutral-100 dark:bg-neutral-900"></div>`;
          let articleHref;
          try {
            const u = new URL("article.html", window.location.href);
            u.searchParams.set("slug", a.slug);
            articleHref = u.href;
          } catch {
            articleHref = "article.html?slug=" + encodeURIComponent(a.slug);
          }
          return `<a href="${articleHref.replace(/"/g, "&quot;")}" class="group block rounded-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden bg-white/80 dark:bg-neutral-950/40 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
            ${cover}
            <div class="p-5">
              <span class="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">${typeLabel}</span>
              <h3 class="mt-2 text-lg font-semibold font-bricolage text-black dark:text-white leading-snug group-hover:underline">${escapeHtml(a.title)}</h3>
              <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">${escapeHtml(a.summary || "")}</p>
            </div>
          </a>`;
        })
        .join("");
    }

    document.getElementById("tabAll")?.addEventListener("click", () => {
      filter = "all";
      paint();
    });
    document.getElementById("tabTutorial")?.addEventListener("click", () => {
      filter = "tutorial";
      paint();
    });
    document.getElementById("tabCase")?.addEventListener("click", () => {
      filter = "case";
      paint();
    });
    paint();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const data = await loadData();
      // 勿用 pathname.includes("article.html")：部分服务器路径是 /article 无扩展名，
      // 会误判为列表页；article.html 又没有 #learnListMount，renderList 会直接 return → 白屏。
      const slug = new URLSearchParams(location.search).get("slug");
      const articleMount = document.getElementById("articleMount");
      const learnListMount = document.getElementById("learnListMount");
      if (articleMount) {
        renderArticle(data, slug);
      } else if (learnListMount) {
        renderList(data);
      }
    } catch (e) {
      const el = document.getElementById("learnListMount") || document.getElementById("articleMount");
      if (el) el.innerHTML = `<p class="text-sm text-red-600">${escapeHtml(e.message || String(e))}</p>`;
    }
  });
})();

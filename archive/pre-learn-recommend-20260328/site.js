// Aether 首页交互：工具库（精选/展开）、AI 浮窗、论坛（localStorage）

(() => {
  const categories = window.AIGC_CATEGORIES || [];
  const allTools = window.AIGC_TOOLS || [];
  const ensureImages = window.AIGC_ENSURE_TOOL_IMAGES || ((t) => t.images || { a: "", b: "" });

  // --- tools grid ---
  const browseFull = !!window.AETHER_BROWSE_FULL;
  const state = { category: "all", query: "", expanded: browseFull };
  const $cats = document.getElementById("categories");
  const $grid = document.getElementById("grid");
  const $search = document.getElementById("search");
  const $clear = document.getElementById("clearFilters");
  const $year = document.getElementById("year");
  if ($year) $year.textContent = String(new Date().getFullYear());

  function normalize(s) {
    return String(s || "").toLowerCase().trim();
  }

  function catChip({ id, label, active }) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.cat = id;
    const onToolsCurtain = !!$cats?.closest?.(".tools-curtain");
    const base = "px-4 py-2 rounded-full text-sm font-medium border transition-colors ";
    btn.className =
      base +
      (onToolsCurtain
        ? active
          ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-950 dark:border-white shadow-sm"
          : "bg-white/55 dark:bg-white/10 border-neutral-300/70 dark:border-white/15 text-neutral-700 dark:text-neutral-200 hover:bg-white/80 dark:hover:bg-white/15"
        : active
          ? "bg-black text-white dark:bg-white dark:text-black border-black/10 dark:border-white/10"
          : "bg-white/70 dark:bg-neutral-950/30 border-neutral-200/70 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900");
    btn.textContent = label;
    return btn;
  }

  function renderCategories() {
    if (!$cats) return;
    $cats.innerHTML = "";
    $cats.appendChild(catChip({ id: "all", label: "全部", active: state.category === "all" }));
    for (const c of categories) $cats.appendChild(catChip({ id: c.id, label: c.label, active: state.category === c.id }));
  }

  function matches(tool) {
    const q = normalize(state.query);
    const inCat = state.category === "all" || tool.category === state.category;
    if (!inCat) return false;
    if (!q) return true;
    const hay = normalize([tool.name, tool.tagline, tool.description, ...(tool.highlights || [])].join(" "));
    return hay.includes(q);
  }

  function toolCard(tool) {
    const imgs = ensureImages(tool);
    const a = imgs?.a;
    const b = imgs?.b;
    const cat = categories.find((c) => c.id === tool.category);
    const href = `./tool.html?id=${encodeURIComponent(tool.id)}`;
    const el = document.createElement("a");
    el.href = href;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    const onCurtain = !!$grid?.closest?.(".tools-curtain");
    el.className =
      "tool-card group block min-w-0 rounded-none border overflow-hidden transition-transform duration-300 ease-out " +
      (onCurtain
        ? "border-neutral-200/90 dark:border-white/15 bg-white/50 dark:bg-neutral-950/45 backdrop-blur-md shadow-[0_12px_32px_-20px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_32px_-20px_rgba(0,0,0,0.45)] hover:shadow-[0_20px_44px_-24px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_20px_44px_-24px_rgba(0,0,0,0.55)]"
        : "border-neutral-200/70 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/30 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.35)] hover:shadow-[0_22px_60px_-34px_rgba(0,0,0,0.50)]");
    el.innerHTML = `
      <div class="relative aspect-[16/10] overflow-hidden">
        <div class="absolute inset-0 tool-img-layer tool-img-a bg-cover bg-center" style="background-image:url('${a}')"></div>
        <div class="absolute inset-0 tool-img-layer tool-img-b bg-cover bg-center" style="background-image:url('${b}')"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-80"></div>
        <div class="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
          <div class="min-w-0">
            <div class="text-xs text-white/70">${cat ? cat.label : ""}</div>
            <div class="mt-1 text-lg font-semibold text-white truncate">${tool.name}</div>
          </div>
          <div class="shrink-0 h-9 w-9 rounded-full bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
            <span aria-hidden="true">↗</span>
          </div>
        </div>
      </div>
      <div class="p-5 ${onCurtain ? "bg-white/40 dark:bg-neutral-950/35" : ""}">
        <div class="text-sm ${onCurtain ? "text-neutral-800 dark:text-neutral-200" : "text-neutral-700 dark:text-neutral-200"} font-medium leading-snug">${tool.tagline}</div>
        <div class="mt-3 flex flex-wrap gap-2">
          ${(tool.highlights || [])
            .slice(0, 3)
            .map((h) => `<span class="text-xs px-2 py-0.5 rounded-none border ${onCurtain ? "border-neutral-300/80 dark:border-white/15 text-neutral-600 dark:text-neutral-300 bg-white/50 dark:bg-white/5" : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 bg-white/60 dark:bg-neutral-950/20"}">${h}</span>`)
            .join("")}
        </div>
      </div>
    `;
    return el;
  }

  function renderGrid() {
    if (!$grid) return;
    $grid.innerHTML = "";
    const onCurtain = !!$grid.closest?.(".tools-curtain");
    $grid.className =
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch" + (onCurtain ? " min-h-[280px]" : "");
    const filtered = allTools.filter(matches);
    const q = normalize(state.query);
    const featuredOnly = !state.expanded && !q && state.category === "all";
    const display = featuredOnly ? filtered.filter((t) => !!t.featured).slice(0, 6) : filtered;

    if (!display.length) {
      const empty = document.createElement("div");
      empty.className =
        "col-span-full rounded-none border border-dashed p-12 flex items-center justify-center min-h-[200px] " +
        (onCurtain ? "border-neutral-300/60 dark:border-white/20 bg-white/35 dark:bg-white/5" : "border-neutral-200 dark:border-neutral-800");
      empty.setAttribute("aria-hidden", "true");
      $grid.appendChild(empty);
      return;
    }
    for (const t of display) $grid.appendChild(toolCard(t));
  }

  renderCategories();
  renderGrid();

  if ($cats) {
    $cats.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-cat]");
      if (!btn) return;
      state.category = btn.dataset.cat;
      if (!browseFull) {
        state.expanded = state.category !== "all" || !!normalize(state.query);
      }
      renderCategories();
      renderGrid();
    });
  }
  if ($search) {
    $search.addEventListener("input", (e) => {
      state.query = e.target.value || "";
      if (!browseFull) {
        state.expanded = !!normalize(state.query) || state.category !== "all";
      }
      renderGrid();
    });
  }
  if ($clear) {
    $clear.addEventListener("click", () => {
      state.category = "all";
      state.query = "";
      if (!browseFull) state.expanded = false;
      if ($search) $search.value = "";
      renderCategories();
      renderGrid();
    });
  }
  // --- AI chat ---
  const AI_STORAGE_KEY = "aether_ai_config_v1";
  const $aiFab = document.getElementById("aiFab");
  const $aiPanel = document.getElementById("aiPanel");
  const $aiClose = document.getElementById("aiClose");
  const $aiSettingsBtn = document.getElementById("aiSettingsBtn");
  const $aiSettings = document.getElementById("aiSettings");
  const $aiBaseUrl = document.getElementById("aiBaseUrl");
  const $aiModel = document.getElementById("aiModel");
  const $aiKey = document.getElementById("aiKey");
  const $aiSave = document.getElementById("aiSave");
  const $aiClear = document.getElementById("aiClear");
  const $aiMessages = document.getElementById("aiMessages");
  const $aiForm = document.getElementById("aiForm");
  const $aiInput = document.getElementById("aiInput");
  const $aiSend = document.getElementById("aiSend");

  function aiLoadConfig() {
    try {
      return JSON.parse(localStorage.getItem(AI_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }
  function aiSaveConfig(cfg) {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(cfg || {}));
  }
  function aiApplyConfigToUI(cfg) {
    if ($aiBaseUrl) $aiBaseUrl.value = cfg.baseUrl || "http://localhost:8787/v1";
    if ($aiModel) $aiModel.value = cfg.model || "gpt-4o-mini";
    if ($aiKey) $aiKey.value = cfg.key || "";
  }
  function aiToggle(open) {
    if (!$aiPanel) return;
    $aiPanel.classList.toggle("hidden", !open);
  }
  function aiAddBubble({ role, text }) {
    if (!$aiMessages) return;
    const wrap = document.createElement("div");
    wrap.className = `flex ${role === "user" ? "justify-end" : "justify-start"}`;
    const bubble = document.createElement("div");
    bubble.className =
      "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed border " +
      (role === "user"
        ? "bg-black text-white dark:bg-white dark:text-black border-black/10 dark:border-white/10"
        : "bg-white/70 dark:bg-neutral-950/30 text-neutral-800 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800");
    bubble.textContent = text;
    wrap.appendChild(bubble);
    $aiMessages.appendChild(wrap);
    $aiMessages.scrollTop = $aiMessages.scrollHeight;
  }
  function buildLocalSuggestionReply(userText) {
    const q = normalize(userText);
    const byId = (id) => allTools.find((t) => t.id === id);
    const picks = [];
    if (q.includes("写") || q.includes("研究") || q.includes("总结") || q.includes("检索")) picks.push(byId("perplexity"), byId("claude"), byId("chatgpt"));
    else if (q.includes("出图") || q.includes("图片") || q.includes("海报") || q.includes("logo")) picks.push(byId("midjourney"), byId("ideogram"), byId("leonardo"));
    else if (q.includes("视频") || q.includes("剪辑") || q.includes("动效")) picks.push(byId("runway"), byId("pika"), byId("luma"));
    else if (q.includes("配音") || q.includes("音频") || q.includes("歌曲") || q.includes("音乐")) picks.push(byId("elevenlabs"), byId("suno"), byId("descript"));
    else if (q.includes("开发") || q.includes("代码") || q.includes("agent") || q.includes("前端")) picks.push(byId("cursor"), byId("github-copilot"), byId("v0"));
    else picks.push(byId("chatgpt"), byId("claude"), byId("midjourney"), byId("runway"));
    const uniq = picks.filter(Boolean).filter((t, idx, arr) => arr.findIndex((x) => x.id === t.id) === idx);
    return "建议组合：\n" + uniq.slice(0, 5).map((t) => `- ${t.name}（详情：tool.html?id=${t.id}）`).join("\n");
  }
  async function callOpenAICompatible({ baseUrl, key, model, messages }) {
    const url = String(baseUrl || "").replace(/\/$/, "") + "/chat/completions";
    const headers = { "Content-Type": "application/json" };
    if (key) headers.Authorization = `Bearer ${key}`;
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ model, messages, temperature: 0.6 }) });
    if (!res.ok) throw new Error(await res.text().catch(() => "Request failed"));
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "";
  }

  if ($aiFab && $aiPanel) {
    const cfg = aiLoadConfig();
    aiApplyConfigToUI(cfg);
    $aiFab.addEventListener("click", () => aiToggle(true));
    if ($aiClose) $aiClose.addEventListener("click", () => aiToggle(false));
    if ($aiSettingsBtn && $aiSettings) $aiSettingsBtn.addEventListener("click", () => $aiSettings.classList.toggle("hidden"));
    if ($aiSave) $aiSave.addEventListener("click", () => { aiSaveConfig({ baseUrl: $aiBaseUrl?.value?.trim(), model: $aiModel?.value?.trim(), key: $aiKey?.value?.trim() }); });
    if ($aiClear) $aiClear.addEventListener("click", () => { aiSaveConfig({}); aiApplyConfigToUI({}); });

    const chatHistory = [{ role: "system", content: "你是 Aether 的 AIGC 工具导航助手，推荐工具组合与工作流。" }];
    if ($aiForm) {
      $aiForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = ($aiInput?.value || "").trim();
        if (!text) return;
        if ($aiInput) $aiInput.value = "";
        aiAddBubble({ role: "user", text });
        const cfg2 = aiLoadConfig();
        const hasBase = !!(cfg2.baseUrl && cfg2.model);
        const hasKey = !!cfg2.key;
        const isLocalProxy = String(cfg2.baseUrl || "").includes("localhost") || String(cfg2.baseUrl || "").includes("127.0.0.1");
        if ($aiSend) $aiSend.disabled = true;
        try {
          let reply = "";
          if (!hasBase || (!hasKey && !isLocalProxy)) reply = buildLocalSuggestionReply(text);
          else {
            chatHistory.push({ role: "user", content: text });
            reply = await callOpenAICompatible({ baseUrl: cfg2.baseUrl, key: cfg2.key, model: cfg2.model, messages: chatHistory });
            chatHistory.push({ role: "assistant", content: reply });
            if (!reply) reply = buildLocalSuggestionReply(text);
          }
          aiAddBubble({ role: "assistant", text: reply });
        } catch {
          aiAddBubble({ role: "assistant", text: buildLocalSuggestionReply(text) });
        } finally {
          if ($aiSend) $aiSend.disabled = false;
        }
      });
    }
  }

  // --- forum（仅本地 localStorage；已配置 Supabase 时由 aether-app.js 接管）---
  if (!window.AETHER_SUPABASE) {
    const FORUM_KEY = "aether_forum_v1";
    const $forumForm = document.getElementById("forumForm");
    const $forumTitle = document.getElementById("forumTitle");
    const $forumTags = document.getElementById("forumTags");
    const $forumBody = document.getElementById("forumBody");
    const $forumSearch = document.getElementById("forumSearch");
    const $forumSort = document.getElementById("forumSort");
    const $forumList = document.getElementById("forumList");
    const $forumDetail = document.getElementById("forumDetail");
    const $forumReset = document.getElementById("forumReset");

    function forumLoad() {
      try {
        const v = JSON.parse(localStorage.getItem(FORUM_KEY) || "[]");
        return Array.isArray(v) ? v : [];
      } catch {
        return [];
      }
    }
    function forumSave(posts) {
      localStorage.setItem(FORUM_KEY, JSON.stringify(posts || []));
    }
    function forumId() {
      return "p_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
    }
    function forumParseTags(s) {
      return String(s || "")
        .split(/[，,]/g)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8);
    }

    const forumState = { selectedId: null, query: "", sort: "new" };

    function forumRender() {
      if (!$forumList || !$forumDetail) return;
      const all = forumLoad();
      const q = normalize(forumState.query);
      const filtered = q ? all.filter((p) => normalize([p.title, p.body, ...(p.tags || [])].join(" ")).includes(q)) : all;
      const sorted = [...filtered].sort((a, b) => {
        if (forumState.sort === "hot") return (b.comments?.length || 0) - (a.comments?.length || 0) || b.createdAt - a.createdAt;
        return b.createdAt - a.createdAt;
      });
      if (!forumState.selectedId && sorted.length) forumState.selectedId = sorted[0].id;
      $forumList.innerHTML = "";
      for (const p of sorted) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.pid = p.id;
        btn.className =
          "w-full text-left px-4 py-3.5 border-b border-neutral-200/60 dark:border-neutral-800/90 hover:bg-neutral-50/90 dark:hover:bg-neutral-900/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500/30";
        btn.innerHTML = `<div class="text-sm font-semibold text-black dark:text-white leading-snug">${p.title}</div><div class="mt-1.5 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">${(p.comments || []).length}</div>`;
        $forumList.appendChild(btn);
      }
      const selected = sorted.find((p) => p.id === forumState.selectedId) || null;
      $forumDetail.innerHTML = selected
        ? `<div class="text-xl font-semibold text-black dark:text-white leading-snug">${selected.title}</div><div class="mt-4 text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-200 leading-relaxed">${selected.body}</div>`
        : "";
    }

    if ($forumForm) {
      if (!forumLoad().length) {
        forumSave([{ id: forumId(), title: "欢迎来到 Aether 论坛", tags: ["公告"], body: "在这里分享你的工具组合与提示词。", createdAt: Date.now() - 3600_000, comments: [] }]);
      }
      forumRender();
      $forumForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = ($forumTitle?.value || "").trim();
        const body = ($forumBody?.value || "").trim();
        if (!title || !body) return;
        const posts = forumLoad();
        const post = { id: forumId(), title, body, tags: forumParseTags($forumTags?.value), createdAt: Date.now(), comments: [] };
        posts.push(post);
        forumSave(posts);
        if ($forumTitle) $forumTitle.value = "";
        if ($forumBody) $forumBody.value = "";
        if ($forumTags) $forumTags.value = "";
        forumState.selectedId = post.id;
        forumRender();
      });
      if ($forumList) $forumList.addEventListener("click", (e) => { const btn = e.target.closest("button[data-pid]"); if (!btn) return; forumState.selectedId = btn.dataset.pid; forumRender(); });
      if ($forumSearch) $forumSearch.addEventListener("input", (e) => { forumState.query = e.target.value || ""; forumRender(); });
      if ($forumSort) $forumSort.addEventListener("change", (e) => { forumState.sort = e.target.value || "new"; forumRender(); });
      if ($forumReset) $forumReset.addEventListener("click", () => { localStorage.removeItem(FORUM_KEY); forumSave([]); forumState.selectedId = null; forumState.query = ""; if ($forumSearch) $forumSearch.value = ""; forumRender(); });
    }
  }
})();


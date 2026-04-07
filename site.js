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
    const onToolsCurtain = !!$cats?.closest?.(".tools-card-shell");
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
    $cats.appendChild(catChip({ id: "all", label: "All", active: state.category === "all" }));
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
    const hrefFn = window.AETHER_TOOL_PAGE_HREF || ((id) => "tool.html?id=" + encodeURIComponent(id));
    const href = hrefFn(tool.id);
    const el = document.createElement("a");
    el.href = href;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    const onCurtain = !!$grid?.closest?.(".tools-card-shell");
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
  const $aiBackdrop = document.getElementById("aiBackdrop");
  const $aiPanel = document.getElementById("aiPanel");
  const $aiClose = document.getElementById("aiClose");
  const $aiSettingsBtn = document.getElementById("aiSettingsBtn");
  const $aiSettingsDone = document.getElementById("aiSettingsDone");
  const $aiSettings = document.getElementById("aiSettings");
  const $aiApiMode = document.getElementById("aiApiMode");
  const $aiPresetMiniMax = document.getElementById("aiPresetMiniMax");
  const $aiBaseUrl = document.getElementById("aiBaseUrl");
  const $aiModel = document.getElementById("aiModel");
  const $aiKey = document.getElementById("aiKey");
  const $aiSave = document.getElementById("aiSave");
  const $aiClear = document.getElementById("aiClear");
  const $aiMessages = document.getElementById("aiMessages");
  const $aiForm = document.getElementById("aiForm");
  const $aiInput = document.getElementById("aiInput");
  const $aiSend = document.getElementById("aiSend");
  const $aiAttachBtn = document.getElementById("aiAttachBtn");
  const $aiFileInput = document.getElementById("aiFileInput");
  const $aiAttachmentList = document.getElementById("aiAttachmentList");

  const AI_MAX_IMAGE_BYTES = 4 * 1024 * 1024;
  const AI_MAX_TEXT_FILE_BYTES = 256 * 1024;
  let aiPendingAttachments = [];

  function isTextishFile(file) {
    const mime = String(file.type || "");
    const name = String(file.name || "");
    if (mime.startsWith("text/")) return true;
    if (/application\/(json|javascript|xml|x-www-form-urlencoded)/i.test(mime)) return true;
    return /\.(txt|md|markdown|csv|json|js|ts|mjs|cjs|html|htm|css|xml|yaml|yml|log|svg)$/i.test(name);
  }

  function readAttachmentFile(file) {
    return new Promise((resolve, reject) => {
      const mime = file.type || "application/octet-stream";
      const name = file.name || "file";
      if (mime.startsWith("image/")) {
        if (file.size > AI_MAX_IMAGE_BYTES) {
          reject(new Error("Image must be under 4 MB"));
          return;
        }
      } else if (isTextishFile(file)) {
        if (file.size > AI_MAX_TEXT_FILE_BYTES) {
          reject(new Error("Text attachment must be under 256 KB"));
          return;
        }
      } else {
        reject(new Error("Only images and common text files (txt/md/json etc.) are supported"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          if (mime.startsWith("image/")) {
            const result = String(reader.result || "");
            const i = result.indexOf(",");
            const base64 = i >= 0 ? result.slice(i + 1) : "";
            if (!base64) {
              reject(new Error("Failed to read image"));
              return;
            }
            resolve({ name, mime, kind: "image", base64, dataUrl: result });
          } else {
            const text = reader.result;
            if (typeof text !== "string") {
              reject(new Error("Could not read as text"));
              return;
            }
            resolve({ name, mime: mime || "text/plain", kind: "text", text });
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      if (mime.startsWith("image/")) reader.readAsDataURL(file);
      else reader.readAsText(file, "UTF-8");
    });
  }

  function buildOpenAIUserContent(text, attachments) {
    const textTrim = String(text || "").trim();
    const parts = [];
    if (textTrim) parts.push({ type: "text", text: textTrim });
    for (const a of attachments || []) {
      if (a.kind === "image") {
        parts.push({
          type: "image_url",
          image_url: { url: `data:${a.mime};base64,${a.base64}` },
        });
      } else if (a.kind === "text") {
        parts.push({ type: "text", text: `\n[Attachment: ${a.name}]\n${a.text}` });
      }
    }
    const onlyImages =
      parts.length > 0 && parts.every((p) => p.type === "image_url");
    if (onlyImages) {
      parts.unshift({ type: "text", text: "Please answer based on the attached file(s)." });
    }
    if (!parts.length) return "";
    if (parts.length === 1 && parts[0].type === "text") return parts[0].text;
    return parts;
  }

  function toAnthropicBlocksFromOpenAIContent(content) {
    if (typeof content === "string") {
      return [{ type: "text", text: content }];
    }
    if (!Array.isArray(content)) {
      return [{ type: "text", text: String(content) }];
    }
    const out = [];
    for (const p of content) {
      if (p.type === "text" && p.text) {
        out.push({ type: "text", text: p.text });
      } else if (p.type === "image_url" && p.image_url?.url) {
        const url = String(p.image_url.url);
        const m = /^data:([^;]+);base64,(.+)$/.exec(url);
        if (m) {
          out.push({
            type: "image",
            source: { type: "base64", media_type: m[1], data: m[2] },
          });
        }
      }
    }
    return out.length ? out : [{ type: "text", text: "" }];
  }

  function renderAiAttachmentList() {
    if (!$aiAttachmentList) return;
    $aiAttachmentList.innerHTML = "";
    for (const att of aiPendingAttachments) {
      const chip = document.createElement("div");
      chip.className =
        "inline-flex items-center gap-1 max-w-full pl-2 pr-1 py-1 rounded-lg text-[11px] font-medium border border-neutral-200/90 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-200 shadow-sm";
      const label = document.createElement("span");
      label.className = "truncate max-w-[148px]";
      label.textContent = att.kind === "image" ? `img · ${att.name}` : att.name;
      label.title = att.name;
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className =
        "shrink-0 h-6 w-6 rounded-md flex items-center justify-center text-neutral-500 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-100";
      rm.setAttribute("aria-label", "Remove attachment");
      rm.innerHTML =
        '<span class="material-symbols-outlined text-[16px] leading-none" aria-hidden="true">close</span>';
      rm.addEventListener("click", () => {
        const j = aiPendingAttachments.indexOf(att);
        if (j >= 0) aiPendingAttachments.splice(j, 1);
        renderAiAttachmentList();
      });
      chip.append(label, rm);
      $aiAttachmentList.appendChild(chip);
    }
  }

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
    if ($aiApiMode) $aiApiMode.value = cfg.apiMode === "anthropic" ? "anthropic" : "openai";
    if ($aiBaseUrl) $aiBaseUrl.value = cfg.baseUrl || "http://localhost:8787/v1";
    if ($aiModel) $aiModel.value = cfg.model || "gpt-4o-mini";
    if ($aiKey) $aiKey.value = cfg.key || "";
  }
  const AI_PANEL_MS = 300;
  let aiPanelOpen = false;

  function aiSetSettingsOpen(open) {
    if (!$aiSettings) return;
    if (open) {
      $aiSettings.classList.remove("max-h-0", "opacity-0", "border-transparent");
      $aiSettings.classList.add("max-h-[min(58vh,480px)]", "opacity-100", "border-neutral-200/70", "dark:border-neutral-800");
    } else {
      $aiSettings.classList.add("max-h-0", "opacity-0", "border-transparent");
      $aiSettings.classList.remove("max-h-[min(58vh,480px)]", "opacity-100", "border-neutral-200/70", "dark:border-neutral-800");
    }
    if ($aiSettingsBtn) $aiSettingsBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function syncAiBackdrop() {
    if (!$aiBackdrop) return;
    if (aiPanelOpen) {
      $aiBackdrop.classList.remove("hidden");
      requestAnimationFrame(() => {
        $aiBackdrop.classList.remove("opacity-0");
        $aiBackdrop.classList.add("opacity-100");
      });
      $aiBackdrop.setAttribute("aria-hidden", "false");
    } else {
      $aiBackdrop.classList.remove("opacity-100");
      $aiBackdrop.classList.add("opacity-0");
      $aiBackdrop.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        if (!aiPanelOpen) $aiBackdrop.classList.add("hidden");
      }, 320);
    }
  }

  function aiToggle(open) {
    if (!$aiPanel) return;
    aiPanelOpen = !!open;
    if ($aiFab) $aiFab.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      $aiPanel.classList.remove("ai-panel-hidden");
      syncAiBackdrop();
    } else {
      aiSetSettingsOpen(false);
      $aiPanel.classList.add("ai-panel-hidden");
      syncAiBackdrop();
    }
  }

  function aiAddBubble({ role, text }) {
    if (!$aiMessages) return;
    const wrap = document.createElement("div");
    wrap.className = `flex ai-chat-bubble-in ${role === "user" ? "justify-end" : "justify-start"}`;
    const bubble = document.createElement("div");
    bubble.className =
      "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm " +
      (role === "user"
        ? "bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 text-white rounded-br-md shadow-indigo-500/15 dark:from-indigo-500 dark:via-violet-500 dark:to-indigo-600 dark:text-white"
        : "bg-white/95 dark:bg-neutral-900/80 text-neutral-800 dark:text-neutral-100 border border-neutral-200/90 dark:border-neutral-700/80 rounded-bl-md");
    bubble.textContent = text;
    wrap.appendChild(bubble);
    $aiMessages.appendChild(wrap);
    $aiMessages.scrollTop = $aiMessages.scrollHeight;
  }

  /** 用户消息：可选图片预览 + 文本（避免大块纯黑气泡） */
  function aiAddUserBubble(text, displayAttachments) {
    if (!$aiMessages) return;
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col items-end gap-2 ai-chat-bubble-in";
    const bubble = document.createElement("div");
    bubble.className =
      "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 text-white rounded-br-md border border-white/10";
    if (displayAttachments && displayAttachments.length) {
      const grid = document.createElement("div");
      grid.className = "flex flex-wrap gap-1.5 justify-end mb-2";
      for (const a of displayAttachments) {
        if (a.kind === "image" && a.dataUrl) {
          const img = document.createElement("img");
          img.src = a.dataUrl;
          img.alt = a.name || "";
          img.className =
            "max-h-28 max-w-[200px] rounded-lg object-cover border border-white/20 bg-black/10";
          grid.appendChild(img);
        } else {
          const chip = document.createElement("span");
          chip.className =
            "text-[10px] px-2 py-1 rounded-md bg-white/15 border border-white/10 truncate max-w-[200px]";
          chip.textContent = a.name || "file";
          grid.appendChild(chip);
        }
      }
      bubble.appendChild(grid);
    }
    if (String(text || "").trim()) {
      const t = document.createElement("div");
      t.className = "whitespace-pre-wrap break-words";
      t.textContent = text;
      bubble.appendChild(t);
    }
    wrap.appendChild(bubble);
    $aiMessages.appendChild(wrap);
    $aiMessages.scrollTop = $aiMessages.scrollHeight;
  }

  function aiAddTypingRow() {
    if (!$aiMessages) return null;
    const wrap = document.createElement("div");
    wrap.className = "flex justify-start ai-chat-bubble-in ai-typing-row";
    wrap.innerHTML = `<div class="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3 text-sm border border-neutral-200/90 dark:border-neutral-700/80 bg-white/95 dark:bg-neutral-900/80 shadow-sm">
      <span class="ai-typing-dot h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
      <span class="ai-typing-dot h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
      <span class="ai-typing-dot h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
    </div>`;
    $aiMessages.appendChild(wrap);
    $aiMessages.scrollTop = $aiMessages.scrollHeight;
    return wrap;
  }
  function buildLocalSuggestionReply(userText) {
    const q = normalize(userText);
    const byId = (id) => allTools.find((t) => t.id === id);
    const picks = [];
    if (q.includes("write") || q.includes("research") || q.includes("summarize") || q.includes("search") || q.includes("写") || q.includes("研究") || q.includes("总结") || q.includes("检索")) picks.push(byId("perplexity"), byId("claude"), byId("chatgpt"));
    else if (q.includes("image") || q.includes("photo") || q.includes("poster") || q.includes("logo") || q.includes("图片") || q.includes("出图") || q.includes("海报")) picks.push(byId("midjourney"), byId("ideogram"), byId("leonardo"));
    else if (q.includes("video") || q.includes("edit") || q.includes("animation") || q.includes("视频") || q.includes("剪辑") || q.includes("动效")) picks.push(byId("runway"), byId("pika"), byId("luma"));
    else if (q.includes("voice") || q.includes("audio") || q.includes("music") || q.includes("song") || q.includes("配音") || q.includes("音频") || q.includes("歌曲") || q.includes("音乐")) picks.push(byId("elevenlabs"), byId("suno"), byId("descript"));
    else if (q.includes("code") || q.includes("dev") || q.includes("agent") || q.includes("frontend") || q.includes("开发") || q.includes("代码") || q.includes("前端")) picks.push(byId("cursor"), byId("github-copilot"), byId("v0"));
    else picks.push(byId("chatgpt"), byId("claude"), byId("midjourney"), byId("runway"));
    const uniq = picks.filter(Boolean).filter((t, idx, arr) => arr.findIndex((x) => x.id === t.id) === idx);
    return "Suggested tools:\n" + uniq.slice(0, 5).map((t) => `- ${t.name} (details: tool.html?id=${t.id})`).join("\n");
  }
  /** 把常见 API 错误转成可读说明（MiniMax 等返回 JSON 时） */
  function humanizeApiErrorMessage(msg) {
    const m = String(msg || "");
    let inner = m;
    try {
      const j = JSON.parse(m);
      if (j.type === "error" && j.error) inner = j.error.message || JSON.stringify(j.error);
    } catch (_) {}
    if (/insufficient balance|1008/i.test(inner) || /insufficient balance|1008/i.test(m)) {
      return "MiniMax account balance insufficient (error 1008). Please check your usage and top up or claim free credits on the MiniMax platform.";
    }
    return m.length > 450 ? m.slice(0, 450) + "…" : m;
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

  /** MiniMax「Anthropic 兼容」：POST {base}/v1/messages，见 https://platform.minimaxi.com/docs/api-reference/text-anthropic-api */
  async function callAnthropicCompatible({ baseUrl, key, model, messages }) {
    const root = String(baseUrl || "").replace(/\/$/, "");
    const url = `${root}/v1/messages`;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": key || "",
      "anthropic-version": "2023-06-01",
    };
    let system = "You are Aether's AIGC tool navigation assistant. Recommend tool combinations and workflows based on the user's goals.";
    const apiMessages = [];
    for (const m of messages) {
      if (m.role === "system") {
        system = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
        continue;
      }
      if (m.role === "assistant") {
        const text = typeof m.content === "string" ? m.content : "";
        apiMessages.push({
          role: "assistant",
          content: [{ type: "text", text }],
        });
        continue;
      }
      apiMessages.push({
        role: m.role,
        content: toAnthropicBlocksFromOpenAIContent(m.content),
      });
    }
    const body = {
      model,
      max_tokens: 2048,
      temperature: 0.7,
      system,
      messages: apiMessages,
    };
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    const raw = await res.text();
    if (!res.ok) throw new Error(raw.slice(0, 500) || "Anthropic/MiniMax request failed");
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("Response is not valid JSON");
    }
    if (data.type === "error" && data.error) {
      throw new Error(raw.slice(0, 800));
    }
    const blocks = data.content || [];
    const lines = [];
    for (const b of blocks) {
      if (b.type === "thinking" && b.thinking) lines.push(b.thinking);
      if (b.type === "text" && b.text) lines.push(b.text);
    }
    return lines.join("\n\n").trim() || "";
  }

  if ($aiFab && $aiPanel) {
    const cfg = aiLoadConfig();
    aiApplyConfigToUI(cfg);
    aiSetSettingsOpen(false);

    $aiFab.addEventListener("click", () => aiToggle(!aiPanelOpen));
    if ($aiClose) $aiClose.addEventListener("click", () => aiToggle(false));
    if ($aiBackdrop) $aiBackdrop.addEventListener("click", () => aiToggle(false));

    if ($aiSettingsBtn && $aiSettings) {
      $aiSettingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = $aiSettingsBtn.getAttribute("aria-expanded") !== "true";
        aiSetSettingsOpen(open);
      });
    }
    if ($aiSettingsDone) $aiSettingsDone.addEventListener("click", () => aiSetSettingsOpen(false));

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!aiPanelOpen) return;
      aiToggle(false);
    });

    if ($aiPresetMiniMax && $aiApiMode && $aiBaseUrl && $aiModel) {
      $aiPresetMiniMax.addEventListener("click", () => {
        $aiApiMode.value = "anthropic";
        $aiBaseUrl.value = "https://api.minimaxi.com/anthropic";
        $aiModel.value = "MiniMax-M2.7";
      });
    }
    if ($aiSave) {
      $aiSave.addEventListener("click", () => {
        aiSaveConfig({
          apiMode: $aiApiMode?.value === "anthropic" ? "anthropic" : "openai",
          baseUrl: $aiBaseUrl?.value?.trim(),
          model: $aiModel?.value?.trim(),
          key: $aiKey?.value?.trim(),
        });
      });
    }
    if ($aiClear) $aiClear.addEventListener("click", () => { aiSaveConfig({}); aiApplyConfigToUI({}); });

    const AI_MAX_ATTACHMENTS = 8;
    if ($aiAttachBtn && $aiFileInput) {
      $aiAttachBtn.addEventListener("click", () => $aiFileInput.click());
      $aiFileInput.addEventListener("change", async () => {
        const files = Array.from($aiFileInput.files || []);
        $aiFileInput.value = "";
        for (const f of files) {
          if (aiPendingAttachments.length >= AI_MAX_ATTACHMENTS) {
            window.alert("Maximum 8 attachments allowed");
            break;
          }
          try {
            aiPendingAttachments.push(await readAttachmentFile(f));
          } catch (err) {
            window.alert(String(err?.message || err));
          }
        }
        renderAiAttachmentList();
      });
    }

    const chatHistory = [{ role: "system", content: "You are Aether's AIGC tool navigation assistant. Recommend tool combinations and workflows based on the user's goals." }];
    if ($aiForm) {
      $aiForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = ($aiInput?.value || "").trim();
        const hasAtt = aiPendingAttachments.length > 0;
        if (!text && !hasAtt) return;
        aiSetSettingsOpen(false);
        if ($aiInput) $aiInput.value = "";
        const snap = aiPendingAttachments.slice();
        const displayForBubble = snap.map((a) =>
          a.kind === "image"
            ? { name: a.name, kind: "image", dataUrl: a.dataUrl }
            : { name: a.name, kind: "text" },
        );
        if (displayForBubble.length) aiAddUserBubble(text, displayForBubble);
        else aiAddBubble({ role: "user", text });
        aiPendingAttachments = [];
        renderAiAttachmentList();
        const userContent = buildOpenAIUserContent(text, snap);
        const cfg2 = aiLoadConfig();
        const inferredAnthropic = /minimaxi\.com\/anthropic/i.test(String(cfg2.baseUrl || ""));
        const apiMode =
          cfg2.apiMode === "anthropic" || inferredAnthropic ? "anthropic" : "openai";
        const hasBase = !!(cfg2.baseUrl && cfg2.model);
        const hasKey = !!cfg2.key;
        const isLocalProxy = String(cfg2.baseUrl || "").includes("localhost") || String(cfg2.baseUrl || "").includes("127.0.0.1");
        if ($aiSend) $aiSend.disabled = true;
        const typingEl = !hasBase || (!hasKey && !isLocalProxy) ? null : aiAddTypingRow();
        const localQuery = text || (snap.length ? `(${snap.length} file(s) attached)` : "");
        try {
          let reply = "";
          if (!hasBase || (!hasKey && !isLocalProxy)) {
            reply =
              snap.length && !text
                ? "No API configured — cannot analyze attachments. Please fill in Base URL and Key in Settings first. Here are some local tool suggestions:\n\n" +
                  buildLocalSuggestionReply(localQuery)
                : buildLocalSuggestionReply(localQuery);
          } else {
            chatHistory.push({ role: "user", content: userContent });
            if (apiMode === "anthropic") {
              reply = await callAnthropicCompatible({
                baseUrl: cfg2.baseUrl,
                key: cfg2.key,
                model: cfg2.model,
                messages: chatHistory,
              });
            } else {
              reply = await callOpenAICompatible({
                baseUrl: cfg2.baseUrl,
                key: cfg2.key,
                model: cfg2.model,
                messages: chatHistory,
              });
            }
            chatHistory.push({ role: "assistant", content: reply });
            if (!reply) reply = buildLocalSuggestionReply(localQuery);
          }
          typingEl?.remove();
          aiAddBubble({ role: "assistant", text: reply });
        } catch (err) {
          typingEl?.remove();
          const raw = String(err?.message || err);
          const hint =
            raw.includes("Failed to fetch") || raw.includes("NetworkError")
              ? "(Possible CORS issue: browsers cannot directly call some APIs — a local proxy or backend relay is needed.)"
              : "";
          const friendly = humanizeApiErrorMessage(raw);
          const showDetail = friendly !== raw ? `${friendly}\n(Technical details: ${raw.slice(0, 220)}${raw.length > 220 ? "…" : ""})` : raw;
          aiAddBubble({
            role: "assistant",
            text: `Request failed: ${showDetail}\n${hint}\n\n—— Local fallback ——\n${buildLocalSuggestionReply(localQuery)}`,
          });
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
        btn.innerHTML = `<div class="text-sm font-semibold font-bricolage text-black dark:text-white leading-snug">${p.title}</div><div class="mt-1.5 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">${(p.comments || []).length}</div>`;
        $forumList.appendChild(btn);
      }
      const selected = sorted.find((p) => p.id === forumState.selectedId) || null;
      $forumDetail.innerHTML = selected
        ? `<div class="text-xl font-semibold font-bricolage text-black dark:text-white leading-snug">${selected.title}</div><div class="mt-4 text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-200 leading-relaxed">${selected.body}</div>`
        : "";
    }

    if ($forumForm) {
      if (!forumLoad().length) {
        forumSave([{ id: forumId(), title: "Welcome to the Aether Forum", tags: ["announcement"], body: "Share your tool combinations and prompts here.", createdAt: Date.now() - 3600_000, comments: [] }]);
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

  const $recommend = document.getElementById("recommend");
  if ($recommend?.classList.contains("recommend-section")) {
    const reveal = () => $recommend.classList.add("recommend-section--revealed");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              reveal();
              io.disconnect();
            }
          }
        },
        { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
      );
      io.observe($recommend);
    }
  }
})();


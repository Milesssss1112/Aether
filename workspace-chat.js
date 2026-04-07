/**
 * 工作台主对话区：与首页 AI 共用 localStorage aether_ai_config_v1
 */
(function () {
  const AI_STORAGE_KEY = "aether_ai_config_v1";
  const AI_MAX_IMAGE_BYTES = 4 * 1024 * 1024;
  const AI_MAX_TEXT_FILE_BYTES = 256 * 1024;
  const AI_MAX_ATTACHMENTS = 8;

  const $messages = document.getElementById("wsMessages");
  const $input = document.getElementById("wsInput");
  const $send = document.getElementById("wsSend");
  const $tech = document.getElementById("wsTechStack");
  const $model = document.getElementById("wsModelPick");
  const $attachBtn = document.getElementById("wsAttachBtn");
  const $fileInput = document.getElementById("wsFileInput");
  const $attachChips = document.getElementById("wsAttachmentChips");
  const $promptBtn = document.getElementById("wsPromptBuilderBtn");
  const $promptMenu = document.getElementById("wsPromptMenu");
  const $mentionBtn = document.getElementById("wsMentionBtn");
  const $mentionMenu = document.getElementById("wsMentionMenu");
  const $linkBtn = document.getElementById("wsLinkBtn");
  const $layoutBtn = document.getElementById("wsLayoutBtn");
  const $composer = document.getElementById("wsComposer");

  if (!$messages || !$input || !$send) return;

  let pendingAttachments = [];
  const chatHistory = [
    {
      role: "system",
      content: `You are Aether's creative AI workspace assistant. You help users discover AIGC tools, build workflows, and learn creative techniques.

RESPONSE FORMAT — IMPORTANT:
Always respond with a single JSON object. Never output plain text outside of JSON.

Schema:
{
  "type": "text" | "tool_card" | "tutorial_card" | "workflow_step_list",
  // For type "text":
  "content": "<markdown-lite string>",

  // For type "tool_card":
  "title": "<tool name>",
  "description": "<1-2 sentence description>",
  "link": "<official URL>",
  "tutorial_link": "<tutorial or docs URL, optional>",
  "prompt_template": "<example prompt the user can copy, optional>",
  "tags": ["<tag>"],

  // For type "tutorial_card":
  "title": "<tutorial title>",
  "steps": ["<step 1>", "<step 2>", ...],
  "tip": "<pro tip, optional>",
  "tool": "<tool name this tutorial is for>",

  // For type "workflow_step_list":
  "title": "<workflow title>",
  "steps": [
    { "step": 1, "tool": "<tool name>", "action": "<what to do>", "output": "<what you get>" }
  ],
  "summary": "<one-line summary>"
}

Rules:
- Use "tool_card" when the user asks about a specific tool or asks for a recommendation.
- Use "tutorial_card" when the user asks how to do something with a specific tool.
- Use "workflow_step_list" when the user asks for a workflow, pipeline, or multi-step process.
- Use "text" for greetings, clarifying questions, or anything that doesn't fit the above.
- Always output valid JSON. No markdown fences, no extra keys.`,
    },
  ];

  function loadCfg() {
    try {
      return JSON.parse(localStorage.getItem(AI_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function isTextishFile(file) {
    const mime = String(file.type || "");
    const name = String(file.name || "");
    if (mime.startsWith("text/")) return true;
    if (/application\/(json|javascript|xml)/i.test(mime)) return true;
    return /\.(txt|md|markdown|csv|json|js|ts|html|htm|css|xml|yaml|yml|log|svg)$/i.test(name);
  }

  function readAttachmentFile(file) {
    return new Promise((resolve, reject) => {
      const mime = file.type || "application/octet-stream";
      const name = file.name || "file";
      if (mime.startsWith("image/")) {
        if (file.size > AI_MAX_IMAGE_BYTES) {
          reject(new Error("Image must be smaller than 4MB"));
          return;
        }
      } else if (isTextishFile(file)) {
        if (file.size > AI_MAX_TEXT_FILE_BYTES) {
          reject(new Error("Text attachment must be smaller than 256KB"));
          return;
        }
      } else {
        reject(new Error("Only images and common text files are supported"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
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
            reject(new Error("Cannot read file as text"));
            return;
          }
          resolve({ name, mime: mime || "text/plain", kind: "text", text });
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
    const onlyImages = parts.length > 0 && parts.every((p) => p.type === "image_url");
    if (onlyImages) parts.unshift({ type: "text", text: "Please answer based on the attached image(s)." });
    if (!parts.length) return "";
    if (parts.length === 1 && parts[0].type === "text") return parts[0].text;
    return parts;
  }

  function toAnthropicBlocksFromOpenAIContent(content) {
    if (typeof content === "string") return [{ type: "text", text: content }];
    if (!Array.isArray(content)) return [{ type: "text", text: String(content) }];
    const out = [];
    for (const p of content) {
      if (p.type === "text" && p.text) out.push({ type: "text", text: p.text });
      else if (p.type === "image_url" && p.image_url?.url) {
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
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, messages, temperature: 0.6 }),
    });
    if (!res.ok) throw new Error(await res.text().catch(() => "Request failed"));
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "";
  }

  async function callAnthropicCompatible({ baseUrl, key, model, messages }) {
    const root = String(baseUrl || "").replace(/\/$/, "");
    const url = `${root}/v1/messages`;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": key || "",
      "anthropic-version": "2023-06-01",
    };
    let system =
      "You are Aether's creative workspace assistant. Recommend AIGC tool combinations and actionable steps based on the user's goals and tech stack preferences.";
    const apiMessages = [];
    for (const m of messages) {
      if (m.role === "system") {
        system = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
        continue;
      }
      if (m.role === "assistant") {
        const text = typeof m.content === "string" ? m.content : "";
        apiMessages.push({ role: "assistant", content: [{ type: "text", text }] });
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
    if (!res.ok) throw new Error(raw.slice(0, 500) || "Request failed");
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("Response is not valid JSON");
    }
    if (data.type === "error" && data.error) throw new Error(raw.slice(0, 800));
    const blocks = data.content || [];
    const lines = [];
    for (const b of blocks) {
      if (b.type === "thinking" && b.thinking) lines.push(b.thinking);
      if (b.type === "text" && b.text) lines.push(b.text);
    }
    return lines.join("\n\n").trim() || "";
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function removeEmptyState() {
    document.getElementById("wsEmptyState")?.remove();
  }

  // ── JSON response parser ───────────────────────────────────────────────
  function parseAIResponse(raw) {
    const s = String(raw || "").trim();
    // strip optional ```json ... ``` fences
    const fenced = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    try {
      const obj = JSON.parse(fenced);
      if (obj && typeof obj === "object" && obj.type) return obj;
    } catch (_) {}
    // fallback: treat as plain text
    return { type: "text", content: s };
  }

  // ── Rich message renderers ─────────────────────────────────────────────
  function renderText(data) {
    const el = document.createElement("div");
    el.className = "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words " +
      "bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 " +
      "border border-neutral-200/80 dark:border-neutral-800 rounded-bl-md";
    // simple inline markdown: **bold**, `code`, newlines
    const html = escapeHtml(data.content || "")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[11px] font-mono">$1</code>')
      .replace(/\n/g, "<br/>");
    el.innerHTML = html;
    return el;
  }

  function renderToolCard(data) {
    const el = document.createElement("div");
    el.className = "max-w-[92%] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 " +
      "bg-white dark:bg-neutral-900 overflow-hidden shadow-sm rounded-bl-md";
    const tags = (data.tags || []).map(t =>
      `<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">${escapeHtml(t)}</span>`
    ).join("");
    const tutorialBtn = data.tutorial_link
      ? `<a href="${escapeHtml(data.tutorial_link)}" target="_blank" rel="noopener"
           class="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
           <span class="material-symbols-outlined text-[14px]">play_circle</span>Tutorial
         </a>`
      : "";
    const promptBlock = data.prompt_template
      ? `<div class="mt-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700 p-3">
           <p class="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Prompt Template</p>
           <p class="text-xs text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">${escapeHtml(data.prompt_template)}</p>
           <button type="button" onclick="navigator.clipboard.writeText(${JSON.stringify(data.prompt_template || '')});this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)"
             class="mt-2 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Copy</button>
         </div>`
      : "";
    el.innerHTML = `
      <div class="px-4 pt-4 pb-3">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div>
            <p class="text-sm font-bold text-neutral-900 dark:text-neutral-100">${escapeHtml(data.title || "")}</p>
            ${tags ? `<div class="flex flex-wrap gap-1 mt-1">${tags}</div>` : ""}
          </div>
          ${data.link ? `<a href="${escapeHtml(data.link)}" target="_blank" rel="noopener"
            class="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-700 transition-colors">
            Visit <span class="material-symbols-outlined text-[13px]">arrow_outward</span>
          </a>` : ""}
        </div>
        <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">${escapeHtml(data.description || "")}</p>
        ${promptBlock}
        ${tutorialBtn ? `<div class="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">${tutorialBtn}</div>` : ""}
      </div>`;
    return el;
  }

  function renderTutorialCard(data) {
    const el = document.createElement("div");
    el.className = "max-w-[92%] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 " +
      "bg-white dark:bg-neutral-900 overflow-hidden shadow-sm rounded-bl-md";
    const steps = (data.steps || []).map((s, i) =>
      `<li class="flex gap-3 items-start">
        <span class="shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center mt-0.5">${i + 1}</span>
        <span class="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">${escapeHtml(s)}</span>
      </li>`
    ).join("");
    const tip = data.tip
      ? `<div class="mt-3 flex gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30">
           <span class="material-symbols-outlined text-amber-500 text-[16px] shrink-0 mt-0.5">lightbulb</span>
           <p class="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">${escapeHtml(data.tip)}</p>
         </div>`
      : "";
    el.innerHTML = `
      <div class="px-4 pt-4 pb-4">
        <div class="flex items-center gap-2 mb-3">
          <span class="material-symbols-outlined text-[18px] text-indigo-500">play_circle</span>
          <div>
            <p class="text-sm font-bold text-neutral-900 dark:text-neutral-100">${escapeHtml(data.title || "")}</p>
            ${data.tool ? `<p class="text-[10px] text-neutral-400">${escapeHtml(data.tool)}</p>` : ""}
          </div>
        </div>
        <ol class="flex flex-col gap-2.5">${steps}</ol>
        ${tip}
      </div>`;
    return el;
  }

  function renderWorkflowStepList(data) {
    const el = document.createElement("div");
    el.className = "max-w-[92%] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 " +
      "bg-white dark:bg-neutral-900 overflow-hidden shadow-sm rounded-bl-md";
    const steps = (data.steps || []).map((s, i) => {
      const isLast = i === (data.steps.length - 1);
      return `<div class="flex gap-3">
        <div class="flex flex-col items-center">
          <div class="w-7 h-7 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">${s.step || i + 1}</div>
          ${!isLast ? '<div class="w-px flex-1 bg-indigo-200 dark:bg-indigo-800 my-1"></div>' : ""}
        </div>
        <div class="pb-4 min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-0.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">${escapeHtml(String(s.tool || ""))}</span>
          </div>
          <p class="text-xs font-semibold text-neutral-800 dark:text-neutral-100">${escapeHtml(String(s.action || ""))}</p>
          ${s.output ? `<p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">→ ${escapeHtml(String(s.output))}</p>` : ""}
        </div>
      </div>`;
    }).join("");
    el.innerHTML = `
      <div class="px-4 pt-4 pb-2">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-[18px] text-indigo-500">account_tree</span>
          <p class="text-sm font-bold text-neutral-900 dark:text-neutral-100">${escapeHtml(data.title || "Workflow")}</p>
        </div>
        <div>${steps}</div>
        ${data.summary ? `<div class="mt-1 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <p class="text-xs text-neutral-500 dark:text-neutral-400 italic">${escapeHtml(data.summary)}</p>
        </div>` : ""}
      </div>`;
    return el;
  }

  function appendAssistantMessage(raw) {
    removeEmptyState();
    const data = parseAIResponse(raw);
    const wrap = document.createElement("div");
    wrap.dataset.wsBubble = "1";
    wrap.className = "flex justify-start animate-[fadeInUp_0.35s_ease-out]";
    let card;
    switch (data.type) {
      case "tool_card":        card = renderToolCard(data); break;
      case "tutorial_card":   card = renderTutorialCard(data); break;
      case "workflow_step_list": card = renderWorkflowStepList(data); break;
      default:                card = renderText(data); break;
    }
    wrap.appendChild(card);
    $messages.appendChild(wrap);
    $messages.scrollTop = $messages.scrollHeight;
  }

  function appendBubble(role, text) {
    if (role === "assistant") { appendAssistantMessage(text); return; }
    removeEmptyState();
    const wrap = document.createElement("div");
    wrap.dataset.wsBubble = "1";
    wrap.className = "flex justify-end animate-[fadeInUp_0.35s_ease-out]";
    const bubble = document.createElement("div");
    bubble.className = "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words " +
      "bg-indigo-600 text-white rounded-br-md shadow-sm";
    bubble.innerHTML = escapeHtml(text).replace(/\n/g, "<br/>");
    wrap.appendChild(bubble);
    $messages.appendChild(wrap);
    $messages.scrollTop = $messages.scrollHeight;
  }

  function appendUserWithImages(text, displayAtt) {
    removeEmptyState();
    const wrap = document.createElement("div");
    wrap.dataset.wsBubble = "1";
    wrap.className = "flex justify-end animate-[fadeInUp_0.35s_ease-out]";
    const bubble = document.createElement("div");
    bubble.className =
      "max-w-[92%] rounded-2xl px-4 py-3 text-sm bg-indigo-600 text-white rounded-br-md shadow-sm";
    if (displayAtt?.length) {
      const row = document.createElement("div");
      row.className = "flex flex-wrap gap-2 justify-end mb-2";
      for (const a of displayAtt) {
        if (a.kind === "image" && a.dataUrl) {
          const img = document.createElement("img");
          img.src = a.dataUrl;
          img.alt = "";
          img.className = "max-h-24 rounded-lg border border-white/20 object-cover";
          row.appendChild(img);
        } else {
          const s = document.createElement("span");
          s.className = "text-[10px] px-2 py-1 rounded bg-white/15";
          s.textContent = a.name;
          row.appendChild(s);
        }
      }
      bubble.appendChild(row);
    }
    if (text) {
      const t = document.createElement("div");
      t.className = "whitespace-pre-wrap break-words";
      t.textContent = text;
      bubble.appendChild(t);
    }
    wrap.appendChild(bubble);
    $messages.appendChild(wrap);
    $messages.scrollTop = $messages.scrollHeight;
  }

  function appendTyping() {
    const wrap = document.createElement("div");
    wrap.className = "flex justify-start ws-typing-row";
    wrap.innerHTML = `<div class="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3 text-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
      <span class="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
      <span class="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" style="animation-delay:0.15s"></span>
      <span class="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" style="animation-delay:0.3s"></span>
    </div>`;
    $messages.appendChild(wrap);
    $messages.scrollTop = $messages.scrollHeight;
    return wrap;
  }

  function localFallbackReply(userText) {
    const tools = window.AIGC_TOOLS || [];
    const q = String(userText || "").toLowerCase();
    const pick = (ids) =>
      ids.map((id) => tools.find((t) => t.id === id)).filter(Boolean).slice(0, 3);
    let ids = ["chatgpt", "claude", "midjourney"];
    if (/image|photo|poster|visual|logo|图|海报|视觉|生成/.test(q)) ids = ["midjourney", "ideogram", "leonardo"];
    if (/video|edit|animation|clip|视频|剪辑|动效/.test(q)) ids = ["runway", "pika", "luma"];
    if (/code|dev|frontend|prototype|agent|代码|前端|原型/.test(q)) ids = ["cursor", "v0", "github-copilot"];
    const hrefFn = window.AETHER_TOOL_PAGE_HREF || ((id) => "tool.html?id=" + encodeURIComponent(id));
    const matched = pick(ids);
    if (matched.length) {
      // Return a workflow_step_list of suggestions
      return JSON.stringify({
        type: "workflow_step_list",
        title: "Suggested Tools (offline mode)",
        steps: matched.map((t, i) => ({
          step: i + 1,
          tool: t.name,
          action: "Visit and explore this tool",
          output: hrefFn(t.id),
        })),
        summary: "No API configured — showing local suggestions only.",
      });
    }
    return JSON.stringify({
      type: "text",
      content: "No API configured. Browse the tool library to find what you need.",
    });
  }

  function renderAttachChips() {
    if (!$attachChips) return;
    $attachChips.innerHTML = "";
    for (const att of pendingAttachments) {
      const chip = document.createElement("div");
      chip.className =
        "inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900";
      chip.innerHTML = `<span class="truncate max-w-[140px]">${escapeHtml(att.name)}</span>`;
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "shrink-0 p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800";
      rm.setAttribute("aria-label", "Remove");
      rm.innerHTML = '<span class="material-symbols-outlined text-[14px]">close</span>';
      rm.addEventListener("click", () => {
        const i = pendingAttachments.indexOf(att);
        if (i >= 0) pendingAttachments.splice(i, 1);
        renderAttachChips();
      });
      chip.appendChild(rm);
      $attachChips.appendChild(chip);
    }
  }

  function closeMenus() {
    $promptMenu?.classList.add("hidden");
    $mentionMenu?.classList.add("hidden");
  }

  function techLabel() {
    const el = $tech;
    if (!el) return "";
    const opt = el.options[el.selectedIndex];
    return opt ? opt.text : "";
  }

  function buildUserPayload(rawText, snap) {
    const tech = techLabel();
    const prefix = tech ? `[Tech stack / output preference: ${tech}]\n\n` : "";
    const body = prefix + String(rawText || "").trim();
    return buildOpenAIUserContent(body, snap);
  }

  async function onSend() {
    const raw = $input.value.trim();
    const snap = pendingAttachments.slice();
    if (!raw && !snap.length) return;
    closeMenus();

    const displaySnap = snap.map((a) =>
      a.kind === "image"
        ? { name: a.name, kind: "image", dataUrl: a.dataUrl }
        : { name: a.name, kind: "text" },
    );
    if (displaySnap.length) appendUserWithImages(raw, displaySnap);
    else appendBubble("user", raw);

    $input.value = "";
    pendingAttachments = [];
    renderAttachChips();

    // 异步触发推荐，不阻塞主聊天流程
    if (raw) fetchRecommendations(raw);

    const cfg = loadCfg();
    const inferredAnthropic = /minimaxi\.com\/anthropic/i.test(String(cfg.baseUrl || ""));
    const apiMode = cfg.apiMode === "anthropic" || inferredAnthropic ? "anthropic" : "openai";
    let model = (cfg.model || "").trim();
    if ($model && $model.value && $model.value !== "__default__") {
      model = $model.value;
    }
    const hasBase = !!(cfg.baseUrl && model);
    const hasKey = !!cfg.key;
    const isLocalProxy =
      String(cfg.baseUrl || "").includes("localhost") ||
      String(cfg.baseUrl || "").includes("127.0.0.1");
    const userContent = buildUserPayload(raw, snap);

    $send.disabled = true;
    const typing = !hasBase || (!hasKey && !isLocalProxy) ? null : appendTyping();
    const queryKey = raw || (snap.length ? `${snap.length} file(s) attached` : "");

    try {
      let reply = "";
      if (!hasBase || (!hasKey && !isLocalProxy)) {
        reply = localFallbackReply(queryKey);
      } else {
        chatHistory.push({ role: "user", content: userContent });
        if (apiMode === "anthropic") {
          reply = await callAnthropicCompatible({
            baseUrl: cfg.baseUrl,
            key: cfg.key,
            model,
            messages: chatHistory,
          });
        } else {
          reply = await callOpenAICompatible({
            baseUrl: cfg.baseUrl,
            key: cfg.key,
            model,
            messages: chatHistory,
          });
        }
        chatHistory.push({ role: "assistant", content: reply || "" });
        if (!reply) reply = localFallbackReply(queryKey);
      }
      typing?.remove();
      appendBubble("assistant", reply);
    } catch (err) {
      typing?.remove();
      const rawErr = String(err?.message || err);
      const friendly = humanizeApiErrorMessage(rawErr);
      appendBubble("assistant", JSON.stringify({
        type: "text",
        content: `Request failed: ${friendly}`,
      }));
    } finally {
      $send.disabled = false;
    }
  }

  // ── Recommendations ──────────────────────────────────────────────────────
  const $recTools = document.getElementById("wsRecommendedTools");
  const $recTutorials = document.getElementById("wsRecommendedTutorials");

  function getSupabaseUrl() {
    return (window.AETHER_CONFIG?.supabaseUrl ?? "").replace(/\/$/, "");
  }
  function getAnonKey() {
    return window.AETHER_CONFIG?.supabaseAnonKey ?? "";
  }

  function renderRecommendedTools(tools) {
    if (!$recTools) return;
    if (!tools?.length) return; // 无结果时保留上一次内容
    $recTools.innerHTML = tools.map((t) => `
      <a href="${escapeHtml(t.url || '#')}" target="_blank" rel="noopener"
         class="flex items-center gap-3 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800
                bg-white dark:bg-neutral-900/50 hover:border-indigo-300/60 dark:hover:border-indigo-700/50
                hover:shadow-sm transition-all group">
        <span class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-base shrink-0">🔧</span>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate">${escapeHtml(t.name ?? "")}</p>
          <p class="text-[10px] text-neutral-500 truncate">${escapeHtml(t.description ?? t.category ?? "")}</p>
        </div>
        <span class="material-symbols-outlined text-[13px] text-neutral-300 group-hover:text-indigo-500 transition-colors shrink-0">arrow_outward</span>
      </a>`).join("");
  }

  function renderRecommendedTutorials(tutorials) {
    if (!$recTutorials) return;
    if (!tutorials?.length) return;
    $recTutorials.innerHTML = tutorials.map((t) => `
      <a href="learn.html?slug=${encodeURIComponent(t.slug ?? '')}"
         class="flex items-start gap-2.5 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800
                bg-neutral-50/80 dark:bg-neutral-900/30 hover:bg-white dark:hover:bg-neutral-900/60
                hover:border-neutral-200 dark:hover:border-neutral-700 transition-all group">
        <span class="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs shrink-0 mt-0.5">📖</span>
        <div class="min-w-0">
          <p class="text-xs font-medium text-neutral-700 dark:text-neutral-300 leading-snug">${escapeHtml(t.title ?? "")}</p>
          <p class="text-[10px] text-neutral-400 mt-0.5 truncate">${escapeHtml(t.content_summary ?? "")}</p>
        </div>
      </a>`).join("");
  }

  async function fetchRecommendations(message) {
    const base = getSupabaseUrl();
    if (!base) return;
    try {
      const res = await fetch(`${base}/functions/v1/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getAnonKey() ? { Authorization: `Bearer ${getAnonKey()}` } : {}),
        },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) return;
      const data = await res.json();
      renderRecommendedTools(data.tools);
      renderRecommendedTutorials(data.tutorials);
    } catch (_) { /* 静默失败，不影响主聊天 */ }
  }

  $send.addEventListener("click", (e) => {
    e.preventDefault();
    onSend();
  });
  $input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  });

  if ($attachBtn && $fileInput) {
    $attachBtn.addEventListener("click", () => $fileInput.click());
    $fileInput.addEventListener("change", async () => {
      const files = Array.from($fileInput.files || []);
      $fileInput.value = "";
      for (const f of files) {
        if (pendingAttachments.length >= AI_MAX_ATTACHMENTS) {
          alert("Maximum 8 attachments");
          break;
        }
        try {
          pendingAttachments.push(await readAttachmentFile(f));
        } catch (err) {
          alert(String(err?.message || err));
        }
      }
      renderAttachChips();
    });
  }

  if ($promptBtn && $promptMenu) {
    $promptBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      $mentionMenu?.classList.add("hidden");
      $promptMenu.classList.toggle("hidden");
    });
    $promptMenu.querySelectorAll("[data-ws-prompt]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const t = btn.getAttribute("data-ws-prompt") || "";
        $input.value = ($input.value ? $input.value + "\n\n" : "") + t;
        $input.focus();
        $promptMenu.classList.add("hidden");
      });
    });
  }

  if ($mentionBtn && $mentionMenu) {
    $mentionBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      $promptMenu?.classList.add("hidden");
      $mentionMenu.classList.toggle("hidden");
    });
    $mentionMenu.querySelectorAll("[data-ws-mention]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const t = btn.getAttribute("data-ws-mention") || "";
        const cur = $input.value;
        const pos = $input.selectionStart ?? cur.length;
        $input.value = cur.slice(0, pos) + t + cur.slice(pos);
        $input.focus();
        $mentionMenu.classList.add("hidden");
      });
    });
  }

  if ($linkBtn) {
    $linkBtn.addEventListener("click", () => {
      const u = window.prompt("Paste a reference link (optional)");
      if (u && u.trim()) {
        const line = `\nReference link: ${u.trim()}`;
        $input.value = ($input.value || "") + line;
        $input.focus();
      }
    });
  }

  let layoutExpanded = false;
  if ($layoutBtn && $composer) {
    $layoutBtn.addEventListener("click", () => {
      layoutExpanded = !layoutExpanded;
      $composer.classList.toggle("ws-composer-expanded", layoutExpanded);
      $layoutBtn.setAttribute("aria-pressed", layoutExpanded ? "true" : "false");
    });
  }

  document.addEventListener("click", () => closeMenus());

  // ── Quick Quality Check ───────────────────────────────────────────────────
  (function initQQC() {
    const toggle   = document.getElementById("wsQQCToggle");
    const body     = document.getElementById("wsQQCBody");
    const chevron  = document.getElementById("wsQQCChevron");

    // Collapsible toggle
    toggle?.addEventListener("click", () => {
      const open = body.classList.toggle("hidden");
      toggle.setAttribute("aria-expanded", String(!open));
      chevron.textContent = open ? "expand_more" : "expand_less";
    });

    // ── ① Image Score (placeholder) ────────────────────────────────────────
    const scoreBtn     = document.getElementById("wsQQCScoreBtn");
    const imageUrlInput = document.getElementById("wsQQCImageUrl");
    const imageResult  = document.getElementById("wsQQCImageResult");
    const imageScore   = document.getElementById("wsQQCImageScore");
    const imageNote    = document.getElementById("wsQQCImageNote");

    async function scoreImage(url) {
      // TODO: replace with real Replicate CLIP call when API key is available
      // POST https://api.replicate.com/v1/models/openai/clip-vit-large-patch14/predictions
      // For now return a mock score after a short delay
      await new Promise((r) => setTimeout(r, 800));
      const mock = (Math.random() * 0.3 + 0.65).toFixed(3); // 0.65–0.95
      return { score: mock, note: "Mock result — connect Replicate API key to enable real scoring." };
    }

    scoreBtn?.addEventListener("click", async () => {
      const url = imageUrlInput?.value.trim();
      if (!url) { imageUrlInput?.focus(); return; }
      scoreBtn.disabled = true;
      scoreBtn.textContent = "…";
      imageResult?.classList.add("hidden");
      try {
        const { score, note } = await scoreImage(url);
        imageScore.textContent = score;
        imageNote.textContent  = note;
        imageResult?.classList.remove("hidden");
      } catch (err) {
        imageScore.textContent = "Error";
        imageNote.textContent  = String(err?.message ?? err);
        imageResult?.classList.remove("hidden");
      } finally {
        scoreBtn.disabled = false;
        scoreBtn.textContent = "Score";
      }
    });

    // ── ② Prompt Analyzer (routes through existing AI chat) ────────────────
    const analyzeBtn   = document.getElementById("wsQQCAnalyzeBtn");
    const promptInput  = document.getElementById("wsQQCPromptInput");
    const promptResult = document.getElementById("wsQQCPromptResult");
    const promptNote   = document.getElementById("wsQQCPromptNote");

    async function analyzePrompt(userPrompt) {
      const cfg = loadCfg();
      const inferredAnthropic = /minimaxi\.com\/anthropic/i.test(String(cfg.baseUrl || ""));
      const apiMode = cfg.apiMode === "anthropic" || inferredAnthropic ? "anthropic" : "openai";
      let model = (cfg.model || "").trim();
      if ($model?.value && $model.value !== "__default__") model = $model.value;

      const hasBase = !!(cfg.baseUrl && model);
      const hasKey  = !!cfg.key;
      const isLocal = String(cfg.baseUrl || "").includes("localhost") ||
                      String(cfg.baseUrl || "").includes("127.0.0.1");

      if (!hasBase || (!hasKey && !isLocal)) {
        // Offline mock
        return "No API configured. Here are generic tips:\n• Add more sensory details (lighting, texture, mood).\n• Specify a style or artist reference.\n• Include aspect ratio or output format.";
      }

      const messages = [
        {
          role: "system",
          content: "Analyze this prompt and suggest improvements. Be concise — return 3 to 5 bullet points only, no preamble.",
        },
        { role: "user", content: userPrompt },
      ];

      if (apiMode === "anthropic") {
        return await callAnthropicCompatible({ baseUrl: cfg.baseUrl, key: cfg.key, model, messages });
      }
      return await callOpenAICompatible({ baseUrl: cfg.baseUrl, key: cfg.key, model, messages });
    }

    analyzeBtn?.addEventListener("click", async () => {
      const prompt = promptInput?.value.trim();
      if (!prompt) { promptInput?.focus(); return; }
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = "Analyzing…";
      promptResult?.classList.add("hidden");
      try {
        const result = await analyzePrompt(prompt);
        // Strip JSON fences if AI returns JSON despite the system prompt
        const text = String(result || "")
          .replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        promptNote.textContent = text;
        promptResult?.classList.remove("hidden");
      } catch (err) {
        promptNote.textContent = `Error: ${String(err?.message ?? err)}`;
        promptResult?.classList.remove("hidden");
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Prompt";
      }
    });
  })();
})();

/**
 * Supabase 上线能力：登录/注册 UI、论坛远程、新闻实时渲染
 * 依赖：config.js → supabase umd → aether-supabase.js → site.js（工具/AI）
 */
(function () {
  const sb = window.AETHER_SUPABASE;
  if (!sb) return;

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function commentCount(row) {
    const fc = row.forum_comments;
    if (!fc || !fc.length) return 0;
    const n = fc[0].count;
    return typeof n === "number" ? n : 0;
  }

  // ---------- Auth ----------
  const $authModal = document.getElementById("authModal");
  const $authOpenBtn = document.getElementById("authOpenBtn");
  const $authUserWrap = document.getElementById("authUserWrap");
  const $authUserLabel = document.getElementById("authUserLabel");
  const $authSignOutBtn = document.getElementById("authSignOutBtn");
  const $authCloseBtn = document.getElementById("authCloseBtn");
  const $authTabSignIn = document.getElementById("authTabSignIn");
  const $authTabSignUp = document.getElementById("authTabSignUp");
  const $authPanelSignIn = document.getElementById("authPanelSignIn");
  const $authPanelSignUp = document.getElementById("authPanelSignUp");
  const $authFormSignIn = document.getElementById("authFormSignIn");
  const $authFormSignUp = document.getElementById("authFormSignUp");
  const $forumReset = document.getElementById("forumReset");

  function setAuthUi(session) {
    const u = session?.user;
    if ($authOpenBtn) $authOpenBtn.classList.toggle("hidden", !!u);
    if ($authUserWrap) $authUserWrap.classList.toggle("hidden", !u);
    if ($authUserLabel && u) {
      $authUserLabel.textContent = u.email || u.user_metadata?.display_name || "User";
    }
  }

  function openAuth(open) {
    if (!$authModal) return;
    $authModal.classList.toggle("hidden", !open);
    $authModal.setAttribute("aria-hidden", open ? "false" : "true");
  }

  if ($forumReset) $forumReset.classList.add("hidden");

  if ($authOpenBtn) $authOpenBtn.addEventListener("click", () => openAuth(true));
  if ($authCloseBtn) $authCloseBtn.addEventListener("click", () => openAuth(false));
  if ($authModal) {
    $authModal.addEventListener("click", (e) => {
      if (e.target === $authModal) openAuth(false);
    });
  }

  function showAuthMode(mode) {
    const signIn = mode === "signin";
    if ($authPanelSignIn) $authPanelSignIn.classList.toggle("hidden", !signIn);
    if ($authPanelSignUp) $authPanelSignUp.classList.toggle("hidden", signIn);
    if ($authTabSignIn) {
      $authTabSignIn.classList.toggle("border-black", signIn);
      $authTabSignIn.classList.toggle("dark:border-white", signIn);
      $authTabSignIn.classList.toggle("border-transparent", !signIn);
    }
    if ($authTabSignUp) {
      $authTabSignUp.classList.toggle("border-black", !signIn);
      $authTabSignUp.classList.toggle("dark:border-white", !signIn);
      $authTabSignUp.classList.toggle("border-transparent", signIn);
    }
  }

  if ($authTabSignIn) $authTabSignIn.addEventListener("click", () => showAuthMode("signin"));
  if ($authTabSignUp) $authTabSignUp.addEventListener("click", () => showAuthMode("signup"));

  if ($authFormSignIn) {
    $authFormSignIn.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData($authFormSignIn);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");
      const errEl = document.getElementById("authError");
      if (errEl) errEl.textContent = "";
      const { error } = await sb.signIn(email, password);
      if (error) {
        if (errEl) errEl.textContent = error.message;
        return;
      }
      openAuth(false);
    });
  }

  if ($authFormSignUp) {
    $authFormSignUp.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData($authFormSignUp);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");
      const displayName = String(fd.get("display_name") || "").trim();
      const errEl = document.getElementById("authError");
      if (errEl) errEl.textContent = "";
      const { error } = await sb.signUp(email, password, displayName);
      if (error) {
        if (errEl) errEl.textContent = error.message;
        return;
      }
      openAuth(false);
    });
  }

  if ($authSignOutBtn) {
    $authSignOutBtn.addEventListener("click", async () => {
      await sb.signOut();
    });
  }

  sb.onAuthStateChange((_event, session) => {
    setAuthUi(session);
  });

  sb.client.auth.getSession().then(({ data: { session } }) => setAuthUi(session));

  // ---------- Forum (remote) ----------
  const $forumForm = document.getElementById("forumForm");
  const $forumTitle = document.getElementById("forumTitle");
  const $forumTags = document.getElementById("forumTags");
  const $forumBody = document.getElementById("forumBody");
  const $forumSearch = document.getElementById("forumSearch");
  const $forumSort = document.getElementById("forumSort");
  const $forumList = document.getElementById("forumList");
  const $forumDetail = document.getElementById("forumDetail");

  const forumState = { selectedId: null, query: "", sort: "new" };
  let forumRows = [];

  function forumParseTags(s) {
    return String(s || "")
      .split(/[，,]/g)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  async function forumRender() {
    if (!$forumList || !$forumDetail) return;
    const { data, error } = await sb.listPosts();
    if (error) {
      console.error(error);
      $forumList.innerHTML = `<div class="p-4 text-sm text-red-600">加载失败：${escapeHtml(error.message)}</div>`;
      return;
    }
    forumRows = data || [];
    const q = String(forumState.query || "")
      .toLowerCase()
      .trim();
    let filtered = forumRows;
    if (q) {
      filtered = forumRows.filter((p) => {
        const hay = [p.title, p.body, ...(p.tags || [])].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }
    const sorted = [...filtered].sort((a, b) => {
      if (forumState.sort === "hot") return commentCount(b) - commentCount(a) || new Date(b.created_at) - new Date(a.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });
    if (!forumState.selectedId && sorted.length) forumState.selectedId = sorted[0].id;
    if (forumState.selectedId && !sorted.find((x) => x.id === forumState.selectedId)) {
      forumState.selectedId = sorted[0]?.id || null;
    }

    $forumList.innerHTML = "";
    for (const p of sorted) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.pid = p.id;
      btn.className =
        "w-full text-left px-4 py-3.5 border-b border-neutral-200/60 dark:border-neutral-800/90 hover:bg-neutral-50/90 dark:hover:bg-neutral-900/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500/30";
      const author = p.profiles?.display_name || "用户";
      btn.innerHTML = `<div class="text-sm font-semibold text-black dark:text-white leading-snug">${escapeHtml(p.title)}</div><div class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">${escapeHtml(author)} · ${commentCount(p)} 回复</div>`;
      $forumList.appendChild(btn);
    }

    const selected = sorted.find((p) => p.id === forumState.selectedId) || null;
    if (!selected) {
      $forumDetail.innerHTML = "";
      return;
    }
    const author = selected.profiles?.display_name || "用户";
    const when = selected.created_at ? new Date(selected.created_at).toLocaleString() : "";
    $forumDetail.innerHTML = `<div class="text-xl font-semibold text-black dark:text-white leading-snug">${escapeHtml(selected.title)}</div>
      <div class="mt-2 text-xs text-neutral-500">${escapeHtml(author)} · ${escapeHtml(when)}</div>
      <div class="mt-4 text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-200 leading-relaxed">${escapeHtml(selected.body)}</div>
      <div id="forumCommentsMount" class="mt-8 border-t border-neutral-200/70 dark:border-neutral-800 pt-6"></div>`;

    const mount = document.getElementById("forumCommentsMount");
    if (mount) {
      const { data: comments, error: cErr } = await sb.listComments(selected.id);
      if (cErr) {
        mount.innerHTML = `<p class="text-sm text-red-600">${escapeHtml(cErr.message)}</p>`;
      } else {
        const list = (comments || [])
          .map(
            (c) =>
              `<div class="mb-4 pb-4 border-b border-neutral-200/50 dark:border-neutral-800/80 last:border-0">
              <div class="text-xs text-neutral-500">${escapeHtml(c.profiles?.display_name || "用户")} · ${c.created_at ? new Date(c.created_at).toLocaleString() : ""}</div>
              <div class="mt-2 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">${escapeHtml(c.body)}</div>
            </div>`
          )
          .join("");
        const {
          data: { session },
        } = await sb.client.auth.getSession();
        const canComment = !!session;
        mount.innerHTML = `
          <div class="text-sm font-semibold text-black dark:text-white mb-3">评论</div>
          ${list || '<p class="text-sm text-neutral-500">暂无评论</p>'}
          ${
            canComment
              ? `<form id="forumCommentForm" class="mt-4 grid gap-2">
              <textarea id="forumCommentBody" rows="3" class="px-4 py-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/40 outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y" placeholder="写下评论…"></textarea>
              <button type="submit" class="rounded-full px-5 py-2 bg-black text-white dark:bg-white dark:text-black text-sm font-semibold w-fit">发送评论</button>
            </form>`
              : '<p class="text-sm text-neutral-500 mt-4">登录后可发表评论</p>'
          }`;
        const cf = document.getElementById("forumCommentForm");
        if (cf) {
          cf.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            const body = (document.getElementById("forumCommentBody")?.value || "").trim();
            if (!body) return;
            const { error: postErr } = await sb.addComment(selected.id, body);
            if (postErr) {
              alert(postErr.message);
              return;
            }
            await forumRender();
          });
        }
      }
    }
  }

  if ($forumForm) {
    $forumForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const {
        data: { session },
      } = await sb.client.auth.getSession();
      if (!session) {
        openAuth(true);
        return;
      }
      const title = ($forumTitle?.value || "").trim();
      const body = ($forumBody?.value || "").trim();
      if (!title || !body) return;
      const tags = forumParseTags($forumTags?.value);
      const { error } = await sb.createPost({ title, body, tags });
      if (error) {
        alert(error.message);
        return;
      }
      if ($forumTitle) $forumTitle.value = "";
      if ($forumBody) $forumBody.value = "";
      if ($forumTags) $forumTags.value = "";
      const { data: posts } = await sb.listPosts();
      const newest = posts?.[0];
      if (newest) forumState.selectedId = newest.id;
      await forumRender();
    });
  }

  if ($forumList) {
    $forumList.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-pid]");
      if (!btn) return;
      forumState.selectedId = btn.dataset.pid;
      await forumRender();
    });
  }
  if ($forumSearch) {
    $forumSearch.addEventListener("input", async (e) => {
      forumState.query = e.target.value || "";
      await forumRender();
    });
  }
  if ($forumSort) {
    $forumSort.addEventListener("change", async (e) => {
      forumState.sort = e.target.value || "new";
      await forumRender();
    });
  }

  forumRender();
  sb.subscribeForumPosts(() => {
    forumRender();
  });

  // ---------- News ----------
  const NEWS_LAYOUT = [
    {
      article:
        "col-span-12 md:col-span-5 md:row-span-2 flex flex-col rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-950/[0.03] dark:bg-white/[0.03] overflow-hidden min-h-[280px]",
      imgClass: "news-card-img w-full shrink-0",
      imgMax: "",
    },
    {
      article:
        "col-span-12 md:col-span-7 md:row-span-1 flex flex-col rounded-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950/40",
      imgClass: "news-card-img w-full max-h-[200px] object-cover",
      imgMax: "",
    },
    {
      article:
        "col-span-12 md:col-span-7 md:row-span-1 flex flex-col rounded-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/40",
      imgClass: "news-card-img w-full max-h-[200px] object-cover",
      imgMax: "",
    },
    {
      article:
        "col-span-12 sm:col-span-6 md:col-span-4 md:row-span-1 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden flex flex-col bg-white/90 dark:bg-neutral-950/35",
      imgClass: "news-card-img w-full",
      imgMax: "",
    },
    {
      article:
        "col-span-12 sm:col-span-6 md:col-span-4 md:row-span-1 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden flex flex-col bg-neutral-50 dark:bg-neutral-900/50",
      imgClass: "news-card-img w-full",
      imgMax: "",
    },
    {
      article: "col-span-12 sm:col-span-6 md:col-span-4 md:row-span-1 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden flex flex-col",
      imgClass: "news-card-img w-full",
      imgMax: "",
    },
    {
      article:
        "col-span-12 md:col-span-6 md:row-span-1 rounded-2xl border border-dashed border-neutral-300/70 dark:border-neutral-600/50 flex flex-col sm:flex-row overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/30",
      imgClass: "w-full sm:w-2/5 object-cover min-h-[140px]",
      imgMax: "",
      split: true,
    },
    {
      article:
        "col-span-12 md:col-span-6 md:row-span-1 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden flex flex-col",
      imgClass: "news-card-img w-full",
      imgMax: "",
    },
    {
      article:
        "col-span-12 md:col-span-12 md:row-span-1 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-gradient-to-r from-indigo-950/20 via-violet-950/10 to-transparent dark:from-indigo-950/40 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4",
      imgClass: "rounded-xl w-full sm:w-40 shrink-0 object-cover aspect-[5/4]",
      imgMax: "",
      wide: true,
    },
  ];

  function renderNewsCard(item) {
    const idx = Math.min(Math.max(Number(item.layout_index) || 0, 0), NEWS_LAYOUT.length - 1);
    const L = NEWS_LAYOUT[idx];
    const title = escapeHtml(item.title);
    const summaryHtml = item.summary
      ? `<p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">${escapeHtml(item.summary)}</p>`
      : "";
    const src = item.source_label
      ? `<p class="mt-2 text-[11px] text-neutral-500">${escapeHtml(item.source_label)}</p>`
      : "";
    const badge = item.badge
      ? `<span class="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">${escapeHtml(item.badge)}</span>`
      : "";
    const link = item.article_url ? escapeHtml(item.article_url) : "";
    const titleInner = link
      ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="hover:underline">${title}</a>`
      : title;
    const imgUrl = item.image_url ? escapeHtml(item.image_url) : "";

    if (L.wide) {
      const img = imgUrl
        ? `<img src="${imgUrl}" alt="" class="${L.imgClass}" loading="lazy" width="400" height="320" />`
        : "";
      return `<article class="${L.article}">
        ${img}
        <div><h3 class="text-base font-semibold text-black dark:text-white">${titleInner}</h3>${summaryHtml}</div>
      </article>`;
    }

    if (L.split) {
      const img = imgUrl
        ? `<img src="${imgUrl}" alt="" class="${L.imgClass}" loading="lazy" width="640" height="400" />`
        : "";
      const sum = item.summary
        ? `<p class="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">${escapeHtml(item.summary)}</p>`
        : "";
      return `<article class="${L.article}">
        ${img}
        <div class="p-4 sm:p-5 flex flex-col justify-center flex-1">
          <h3 class="text-sm font-semibold text-black dark:text-white">${titleInner}</h3>
          ${sum}
        </div>
      </article>`;
    }

    const img = imgUrl ? `<img src="${imgUrl}" alt="" class="${L.imgClass}" loading="lazy" />` : "";
    const bodyPad = idx === 0 ? "p-5 sm:p-6 flex flex-col flex-1" : "p-4 sm:p-5";
    const tClass = idx === 0 ? "text-lg sm:text-xl" : "text-base";
    return `<article class="${L.article}">
      ${img}
      <div class="${bodyPad}">
        ${badge ? `<div>${badge}</div>` : ""}
        <h3 class="mt-${badge ? "2" : "0"} ${tClass} font-semibold text-black dark:text-white leading-snug">${titleInner}</h3>
        ${summaryHtml}
        ${src}
      </div>
    </article>`;
  }

  async function loadNews() {
    const mount = document.getElementById("newsMount");
    if (!mount) return;
    const { data, error } = await sb.listNews();
    if (error) {
      mount.innerHTML = `<p class="text-sm text-red-600 col-span-12">${escapeHtml(error.message)}</p>`;
      return;
    }
    const rows = (data || []).slice().sort((a, b) => (a.layout_index ?? 0) - (b.layout_index ?? 0));
    mount.innerHTML = rows.map(renderNewsCard).join("");
  }

  loadNews();
  sb.subscribeNews(() => {
    loadNews();
  });
})();

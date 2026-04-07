/**
 * Supabase 上线能力：登录/注册 UI、论坛远程、新闻实时渲染
 * 依赖：config.js → supabase umd → aether-supabase.js → site.js（工具/AI）
 */
(function () {
  const sb = window.AETHER_SUPABASE;

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

  function resetAuthMessage() {
    const errEl = document.getElementById("authError");
    if (!errEl) return;
    errEl.textContent = "";
    errEl.classList.remove("text-green-600");
    errEl.classList.add("text-red-600");
  }

  function openAuth(open) {
    if (!$authModal) return;
    if (open) resetAuthMessage();
    $authModal.classList.toggle("hidden", !open);
    $authModal.setAttribute("aria-hidden", open ? "false" : "true");
  }

  if ($forumReset) {
    if (sb) $forumReset.classList.add("hidden");
    else $forumReset.classList.remove("hidden");
  }

  const CONFIG_HINT =
    "未连接 Supabase：请在项目根目录 .env 填写 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY，运行 npm run sync-supabase-config 生成 config.js；或手动编辑 config.js。详见 README-SUPABASE.md。";

  if ($authOpenBtn) $authOpenBtn.addEventListener("click", () => openAuth(true));
  if ($authCloseBtn) $authCloseBtn.addEventListener("click", () => openAuth(false));
  if ($authModal) {
    $authModal.addEventListener("click", (e) => {
      if (e.target === $authModal) openAuth(false);
    });
  }

  function showAuthMode(mode) {
    resetAuthMessage();
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
      resetAuthMessage();
      const errEl = document.getElementById("authError");
      if (!sb) {
        if (errEl) errEl.textContent = CONFIG_HINT;
        return;
      }
      const fd = new FormData($authFormSignIn);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");
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
      resetAuthMessage();
      const errEl = document.getElementById("authError");
      if (!sb) {
        if (errEl) errEl.textContent = CONFIG_HINT;
        return;
      }
      const fd = new FormData($authFormSignUp);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");
      const displayName = String(fd.get("display_name") || "").trim();
      const { data, error } = await sb.signUp(email, password, displayName);
      if (error) {
        if (errEl) errEl.textContent = error.message;
        return;
      }
      if (data?.session) {
        openAuth(false);
      } else if (errEl) {
        errEl.textContent =
          "注册已提交。若项目开启了邮箱验证，请查收邮件并点击确认链接后再登录。";
        errEl.classList.remove("text-red-600");
        errEl.classList.add("text-green-600");
      }
    });
  }

  if ($authSignOutBtn) {
    $authSignOutBtn.addEventListener("click", async () => {
      if (sb) await sb.signOut();
    });
  }

  if (!sb) {
    return;
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
      $forumList.innerHTML = `<div class="p-4 text-sm text-red-600">Failed to load: ${escapeHtml(error.message)}</div>`;
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
      const author = p.profiles?.display_name || p.user_id?.slice(0, 8) || "User";
      btn.innerHTML = `<div class="text-sm font-semibold text-black dark:text-white leading-snug">${escapeHtml(p.title)}</div><div class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">${escapeHtml(author)} · ${commentCount(p)} replies</div>`;
      $forumList.appendChild(btn);
    }

    const selected = sorted.find((p) => p.id === forumState.selectedId) || null;
    if (!selected) {
      $forumDetail.innerHTML = "";
      return;
    }
    const author = selected.profiles?.display_name || selected.user_id?.slice(0, 8) || "User";
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
              <div class="text-xs text-neutral-500">${escapeHtml(c.profiles?.display_name || c.user_id?.slice(0, 8) || "User")} · ${c.created_at ? new Date(c.created_at).toLocaleString() : ""}</div>
              <div class="mt-2 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">${escapeHtml(c.body)}</div>
            </div>`
          )
          .join("");
        const {
          data: { session },
        } = await sb.client.auth.getSession();
        const canComment = !!session;
        mount.innerHTML = `
          <div class="text-sm font-semibold text-black dark:text-white mb-3">Comments</div>
          ${list || '<p class="text-sm text-neutral-500">No comments yet</p>'}
          ${
            canComment
              ? `<form id="forumCommentForm" class="mt-4 grid gap-2">
              <textarea id="forumCommentBody" rows="3" class="px-4 py-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/40 outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y" placeholder="Write a comment…"></textarea>
              <button type="submit" class="rounded-full px-5 py-2 bg-black text-white dark:bg-white dark:text-black text-sm font-semibold w-fit">Post Comment</button>
            </form>`
              : '<p class="text-sm text-neutral-500 mt-4">Sign in to leave a comment</p>'
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

  function formatNewsDate(d) {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch { return ""; }
  }

  function newsSourceLine(item) {
    if (item.source_label) return item.source_label;
    const parts = [item.source, formatNewsDate(item.published_at || item.pub_date)].filter(Boolean);
    return parts.join(" · ");
  }

  function newsBadgeText(item) {
    if (item.badge) return item.badge;
    const c = item.category;
    if (!c || c === "AI" || c === "daily_feed") return "";
    return c;
  }

  function stripBadQuotesFromUrl(u) {
    if (!u) return "";
    return String(u).replace(/[\u201C\u201D\u2018\u2019]/g, "").trim();
  }

  // Badge color map
  const BADGE_COLORS = [
    "text-indigo-600 dark:text-indigo-400",
    "text-sky-600 dark:text-sky-400",
    "text-emerald-600 dark:text-emerald-400",
    "text-violet-600 dark:text-violet-400",
    "text-amber-600 dark:text-amber-400",
    "text-rose-600 dark:text-rose-400",
  ];
  function badgeColor(idx) { return BADGE_COLORS[idx % BADGE_COLORS.length]; }

  function renderNewsFeatured(item, link, imgUrl) {
    const title = escapeHtml(item.title);
    const titleInner = link ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="hover:underline">${title}</a>` : title;
    const b = newsBadgeText(item);
    const badge = b ? `<span class="inline-block text-[10px] font-semibold uppercase tracking-widest ${badgeColor(0)} mb-2">${escapeHtml(b)}</span>` : "";
    const src = newsSourceLine(item);
    return `<article class="news-card-link lg:col-span-3 flex flex-col border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden rounded-xl">
      ${imgUrl ? `<img src="${imgUrl}" alt="" class="w-full h-56 sm:h-72 object-cover" loading="lazy" onerror="this.style.display='none'" />` : ""}
      <div class="p-6 flex flex-col flex-1">
        ${badge}
        <h3 class="text-xl font-semibold font-bricolage text-neutral-900 dark:text-white leading-snug">${titleInner}</h3>
        ${item.summary ? `<p class="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">${escapeHtml(item.summary)}</p>` : ""}
        ${src ? `<p class="mt-4 text-xs text-neutral-400 dark:text-neutral-500">${escapeHtml(src)}</p>` : ""}
      </div>
    </article>`;
  }

  function renderNewsSideItem(item, idx, link, imgUrl) {
    const title = escapeHtml(item.title);
    const titleInner = link ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="hover:underline">${title}</a>` : title;
    const b = newsBadgeText(item);
    const badge = b ? `<span class="text-[10px] font-semibold uppercase tracking-widest ${badgeColor(idx)}">${escapeHtml(b)}</span>` : "";
    const src = newsSourceLine(item);
    return `<article class="news-card-link flex gap-4 bg-white dark:bg-neutral-900 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors">
      ${imgUrl ? `<img src="${imgUrl}" alt="" class="w-20 h-16 object-cover rounded shrink-0" loading="lazy" onerror="this.style.display='none'" />` : ""}
      <div class="min-w-0">
        ${badge}
        <h3 class="mt-1 text-sm font-semibold font-bricolage text-neutral-900 dark:text-white leading-snug line-clamp-2">${titleInner}</h3>
        ${src ? `<p class="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">${escapeHtml(src)}</p>` : ""}
      </div>
    </article>`;
  }

  function renderNewsBottomCard(item, idx, link, imgUrl) {
    const title = escapeHtml(item.title);
    const titleInner = link ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="hover:underline">${title}</a>` : title;
    const b = newsBadgeText(item);
    const badge = b ? `<span class="text-[10px] font-semibold uppercase tracking-widest ${badgeColor(idx)}">${escapeHtml(b)}</span>` : "";
    const src = newsSourceLine(item);
    return `<article class="news-card-link border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl overflow-hidden flex flex-col">
      ${imgUrl ? `<img src="${imgUrl}" alt="" class="w-full h-36 object-cover" loading="lazy" onerror="this.style.display='none'" />` : ""}
      <div class="p-4 flex flex-col flex-1">
        ${badge}
        <h3 class="mt-1.5 text-sm font-semibold font-bricolage text-neutral-900 dark:text-white leading-snug flex-1">${titleInner}</h3>
        ${src ? `<p class="mt-3 text-[11px] text-neutral-400 dark:text-neutral-500">${escapeHtml(src)}</p>` : ""}
      </div>
    </article>`;
  }

  function renderNewsMount(rows) {
    const featured = rows[0];
    const sideItems = rows.slice(1, 5);
    const bottomItems = rows.slice(5, 8);

    const featuredLink = featured ? escapeHtml(stripBadQuotesFromUrl(featured.article_url || featured.url || "")) : "";
    const featuredImg = featured && featured.image_url ? escapeHtml(stripBadQuotesFromUrl(featured.image_url)) : "";

    const sideHtml = sideItems.map((item, i) => {
      const link = escapeHtml(stripBadQuotesFromUrl(item.article_url || item.url || ""));
      const img = item.image_url ? escapeHtml(stripBadQuotesFromUrl(item.image_url)) : "";
      return renderNewsSideItem(item, i + 1, link, img);
    }).join("");

    const bottomHtml = bottomItems.map((item, i) => {
      const link = escapeHtml(stripBadQuotesFromUrl(item.article_url || item.url || ""));
      const img = item.image_url ? escapeHtml(stripBadQuotesFromUrl(item.image_url)) : "";
      return renderNewsBottomCard(item, i + 5, link, img);
    }).join("");

    return `
      <div class="grid lg:grid-cols-5 gap-6">
        ${featured ? renderNewsFeatured(featured, featuredLink, featuredImg) : ""}
        <div class="lg:col-span-2 flex flex-col gap-px border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          ${sideHtml}
        </div>
      </div>
      ${bottomItems.length ? `<div class="grid sm:grid-cols-3 gap-6 mt-6">${bottomHtml}</div>` : ""}
    `;
  }

  async function loadNews() {
    const mount = document.getElementById("newsMount");
    if (!mount) return;
    const { data, error } = await sb.listNews();
    if (error || !data || data.length === 0) return;
    const rows = (data || []).slice().sort((a, b) => {
      const so = Number(b.sort_order || 0) - Number(a.sort_order || 0);
      if (so !== 0) return so;
      const tb = new Date(b.created_at || b.pub_date || 0).getTime();
      const ta = new Date(a.created_at || a.pub_date || 0).getTime();
      return tb - ta;
    });
    const hasValidImages = rows.some(r => String(r.image_url || "").startsWith("http"));
    if (!hasValidImages) return;
    mount.innerHTML = renderNewsMount(rows);
  }

  loadNews();
  sb.subscribeNews(() => { loadNews(); });
})();

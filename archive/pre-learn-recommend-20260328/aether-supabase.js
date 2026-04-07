/**
 * Supabase 客户端与业务 API（Auth / 论坛 / 新闻 / Realtime）
 * 依赖：先于本文件加载 @supabase/supabase-js 与 config.js
 */
(function () {
  const cfg = window.AETHER_CONFIG || {};
  const url = (cfg.supabaseUrl || "").trim();
  const key = (cfg.supabaseAnonKey || "").trim();

  const sbGlobal = typeof supabase !== "undefined" ? supabase : window.supabase;
  if (!url || !key || !sbGlobal || typeof sbGlobal.createClient !== "function") {
    window.AETHER_SUPABASE = null;
    return;
  }

  const client = sbGlobal.createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });

  async function listPosts() {
    let { data, error } = await client
      .from("forum_posts")
      .select("id, title, body, tags, created_at, user_id, profiles(display_name), forum_comments(count)")
      .order("created_at", { ascending: false });
    if (error) {
      const r2 = await client
        .from("forum_posts")
        .select("id, title, body, tags, created_at, user_id, profiles(display_name)")
        .order("created_at", { ascending: false });
      if (r2.error) return { data: null, error: r2.error };
      data = r2.data;
      if (data && Array.isArray(data)) {
        for (const row of data) {
          row.forum_comments = [{ count: 0 }];
        }
      }
      return { data, error: null };
    }
    return { data, error };
  }

  async function createPost({ title, body, tags }) {
    const {
      data: { user },
      error: userErr,
    } = await client.auth.getUser();
    if (userErr || !user) return { data: null, error: userErr || new Error("未登录") };
    const { data, error } = await client
      .from("forum_posts")
      .insert({ user_id: user.id, title, body, tags: tags || [] })
      .select("id")
      .single();
    return { data, error };
  }

  async function deleteOwnPost(postId) {
    const { error } = await client.from("forum_posts").delete().eq("id", postId);
    return { error };
  }

  async function listComments(postId) {
    const { data, error } = await client
      .from("forum_comments")
      .select("id, body, created_at, user_id, profiles(display_name)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    return { data, error };
  }

  async function addComment(postId, body) {
    const {
      data: { user },
      error: userErr,
    } = await client.auth.getUser();
    if (userErr || !user) return { data: null, error: userErr || new Error("未登录") };
    const { data, error } = await client
      .from("forum_comments")
      .insert({ post_id: postId, user_id: user.id, body })
      .select("id")
      .single();
    return { data, error };
  }

  async function listNews() {
    const { data, error } = await client
      .from("news_items")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });
    return { data, error };
  }

  function subscribeForumPosts(onChange) {
    return client
      .channel("forum_posts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_posts" },
        () => onChange && onChange()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_comments" },
        () => onChange && onChange()
      )
      .subscribe();
  }

  function subscribeNews(onChange) {
    return client
      .channel("news_items_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "news_items" },
        () => onChange && onChange()
      )
      .subscribe();
  }

  async function signUp(email, password, displayName) {
    return client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || String(email || "").split("@")[0] || "User" } },
    });
  }

  async function signIn(email, password) {
    return client.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    return client.auth.signOut();
  }

  function onAuthStateChange(cb) {
    return client.auth.onAuthStateChange(cb);
  }

  window.AETHER_SUPABASE = {
    client,
    listPosts,
    createPost,
    deleteOwnPost,
    listComments,
    addComment,
    listNews,
    subscribeForumPosts,
    subscribeNews,
    signUp,
    signIn,
    signOut,
    onAuthStateChange,
  };
})();


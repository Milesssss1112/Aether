/**
 * Supabase Edge Function：拉取 RSS（经 rss2json）并写入教程版 news_items（text id + url + source + pub_date）。
 * Secrets（Dashboard → Edge Functions → Secrets）：
 *   SUPABASE_SERVICE_ROLE_KEY  （必填；勿提交仓库）
 * SUPABASE_URL 由平台注入，一般无需手动设。
 *
 * 部署：supabase functions deploy fetch-ai-news --no-verify-jwt
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RSS_FEEDS = [
  "https://techcrunch.com/category/artificial-intelligence/feed/",
  "https://venturebeat.com/category/ai/feed/",
  "https://feeds.arstechnica.com/arstechnica/technology-lab",
  "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
];

const AI_RE =
  /\b(AI|artificial intelligence|GPT|LLM|Claude|Gemini|OpenAI|Anthropic|machine learning|deep learning|neural|agent)\b/i;

function makeId(url: string): string {
  const b64 = btoa(unescape(encodeURIComponent(url)));
  const alnum = b64.replace(/[^a-zA-Z0-9]/g, "");
  return (alnum.slice(-24) + alnum.slice(0, 12)).slice(0, 32).padEnd(8, "x");
}

async function fetchRSS(rssUrl: string): Promise<any[]> {
  try {
    const apiUrl =
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=10`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || [];
    return items.filter((item: any) =>
      AI_RE.test(
        `${item.title || ""} ${item.description || ""} ${item.content || ""}`,
      )
    );
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing SUPABASE_URL (injected by Supabase when deployed)." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  if (!serviceKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        error:
          "Set secret SUPABASE_SERVICE_ROLE_KEY for this function (Dashboard → Edge Functions → Secrets).",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const allItems: Record<string, unknown>[] = [];

  for (const feed of RSS_FEEDS) {
    let host = "RSS";
    try {
      host = new URL(feed).hostname.replace(/^www\./, "").replace(/^feeds\./, "");
    } catch {
      /* keep */
    }
    const items = await fetchRSS(feed);
    for (const item of items.slice(0, 5)) {
      const link = String(item.link || item.guid || "").trim();
      if (!link) continue;
      const title = String(item.title || "").slice(0, 200);
      if (!title) continue;
      const rawDesc = String(item.description || item.content || "");
      const summary = rawDesc
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 300);
      const pub = item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString();
      const thumb = item.thumbnail || item.enclosure?.link || "";
      const id = makeId(link);
      allItems.push({
        id,
        title,
        summary: summary || null,
        url: link,
        image_url: thumb || null,
        source: host,
        category: "daily_feed",
        pub_date: pub,
        sort_order: Math.floor(Date.now() / 1000) - allItems.length,
      });
    }
  }

  if (allItems.length === 0) {
    return new Response(JSON.stringify({ ok: false, msg: "No items fetched" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await sb.from("news_items").upsert(allItems, {
    onConflict: "id",
  });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: rows } = await sb
    .from("news_items")
    .select("id, created_at")
    .eq("category", "daily_feed")
    .order("created_at", { ascending: false });

  if (rows && rows.length > 40) {
    const toDelete = rows.slice(40).map((r: { id: string }) => r.id);
    await sb.from("news_items").delete().in("id", toDelete);
  }

  return new Response(
    JSON.stringify({ ok: true, upserted: allItems.length }),
    { headers: { "Content-Type": "application/json" } },
  );
});

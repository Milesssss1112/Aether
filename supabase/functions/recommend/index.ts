/**
 * Supabase Edge Function: recommend
 * POST { message: string }
 * 返回 { tools: Tool[], tutorials: Tutorial[] }
 *
 * 部署：supabase functions deploy recommend --no-verify-jwt
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// ── 停用词表（中英混合）──────────────────────────────────────────────────
const STOPWORDS = new Set([
  "a","an","the","is","are","was","were","be","been","being",
  "have","has","had","do","does","did","will","would","could","should",
  "may","might","shall","can","need","dare","ought","used",
  "i","you","he","she","it","we","they","me","him","her","us","them",
  "my","your","his","its","our","their","this","that","these","those",
  "and","or","but","if","in","on","at","to","for","of","with","by",
  "from","up","about","into","through","during","before","after",
  "how","what","when","where","who","which","why",
  "please","help","want","need","make","use","using","used","get",
  "的","了","是","在","我","你","他","她","它","们","这","那","有","和",
  "与","或","但","如","就","都","也","很","不","没","为","以","及",
]);

// ── 关键词提取 ────────────────────────────────────────────────────────────
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,，。！？!?;；:：\-\/\\()\[\]{}'"]+/)
    .map((w) => w.replace(/[^a-z0-9\u4e00-\u9fa5]/g, ""))
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .slice(0, 12); // 最多取 12 个关键词
}

// ── 构造 PostgreSQL tsquery（英文关键词用 | 连接）────────────────────────
function toTsQuery(keywords: string[]): string {
  const ascii = keywords.filter((k) => /^[a-z0-9]+$/.test(k));
  if (!ascii.length) return "";
  return ascii.join(" | ");
}

// ── CORS headers ──────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ── 主处理 ────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // 解析请求体
  let message = "";
  try {
    const body = await req.json();
    message = String(body?.message ?? "").trim();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!message) return json({ error: "message is required" }, 400);

  // 初始化 Supabase（使用 service role 以便全文搜索不受 RLS 限制）
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Missing Supabase env vars" }, 500);
  }
  const sb = createClient(supabaseUrl, serviceKey);

  const keywords = extractKeywords(message);
  const tsQuery = toTsQuery(keywords);

  // ── 搜索 tools ────────────────────────────────────────────────────────
  let tools: unknown[] = [];
  if (tsQuery) {
    // 全文搜索 name + description
    const { data: ftData } = await sb
      .from("tools")
      .select("name, description, category, url, tutorial_url")
      .textSearch("name", tsQuery, { type: "websearch", config: "english" })
      .limit(3);
    tools = ftData ?? [];

    // 如果全文搜索结果不足 3 条，用 ilike 补充
    if (tools.length < 3) {
      const needed = 3 - tools.length;
      const existingNames = tools.map((t: any) => t.name);
      for (const kw of keywords) {
        if (tools.length >= 3) break;
        const { data: likeData } = await sb
          .from("tools")
          .select("name, description, category, url, tutorial_url")
          .ilike("name", `%${kw}%`)
          .not("name", "in", `(${existingNames.map((n) => `"${n}"`).join(",")})`)
          .limit(needed);
        if (likeData?.length) tools = [...tools, ...likeData].slice(0, 3);
      }
    }
  } else {
    // 纯中文消息：全用 ilike 匹配 name
    for (const kw of keywords) {
      if (tools.length >= 3) break;
      const { data } = await sb
        .from("tools")
        .select("name, description, category, url, tutorial_url")
        .ilike("name", `%${kw}%`)
        .limit(3 - tools.length);
      if (data?.length) tools = [...tools, ...data];
    }
    tools = tools.slice(0, 3);
  }

  // ── 搜索 tutorials ────────────────────────────────────────────────────
  let tutorials: unknown[] = [];
  if (tsQuery) {
    const { data: ftData } = await sb
      .from("tutorials")
      .select("title, slug, content_summary")
      .textSearch("title", tsQuery, { type: "websearch", config: "english" })
      .limit(2);
    tutorials = ftData ?? [];
  }
  // ilike 补充
  if (tutorials.length < 2) {
    const needed = 2 - tutorials.length;
    const existingSlugs = tutorials.map((t: any) => t.slug);
    for (const kw of keywords) {
      if (tutorials.length >= 2) break;
      const { data } = await sb
        .from("tutorials")
        .select("title, slug, content_summary")
        .ilike("title", `%${kw}%`)
        .not("slug", "in", `(${existingSlugs.map((s) => `"${s}"`).join(",")})`)
        .limit(needed);
      if (data?.length) tutorials = [...tutorials, ...data].slice(0, 2);
    }
  }

  return json({ tools, tutorials, keywords });
});

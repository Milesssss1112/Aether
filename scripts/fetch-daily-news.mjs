/**
 * 从公开 RSS 拉取新闻并写入 Supabase news_items（教程版表结构 B）：
 *   id text PK, url, source, pub_date, category, sort_order …
 * 使用 service_role 绕过 RLS；切勿把该 key 放进前端或提交仓库。
 *
 * 用法：
 *   在 .env 中设置 SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY
 *   npm run sync-daily-news
 *
 * 可选：NEWS_RSS_URLS 逗号分隔多个 RSS（默认内置若干英文科技源）
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const fileEnv = parseEnvFile(path.join(root, ".env"));
function envGet(k) {
  const v = process.env[k];
  if (v != null && String(v).trim() !== "") return String(v).trim();
  return fileEnv[k] || "";
}
const supabaseUrl = envGet("SUPABASE_URL") || envGet("VITE_SUPABASE_URL");
const serviceKey = envGet("SUPABASE_SERVICE_ROLE_KEY");
const customFeeds = envGet("NEWS_RSS_URLS");

const DEFAULT_FEEDS = [
  { url: "https://feeds.bbc.co.uk/news/technology/rss.xml", name: "BBC Technology" },
  { url: "https://www.theverge.com/rss/index.xml", name: "The Verge" },
  { url: "https://techcrunch.com/feed/", name: "TechCrunch" },
];

function stripCDATA(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .trim();
}

function extractTag(block, tag) {
  const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(r);
  if (!m) return "";
  return stripCDATA(m[1]);
}

function firstImgUrl(html) {
  const m = String(html).match(/src=["']([^"']+)["']/i);
  return m ? m[1].trim() : "";
}

function stripHtml(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeId(url) {
  const b64 = Buffer.from(String(url), "utf8").toString("base64");
  const alnum = b64.replace(/[^a-zA-Z0-9]/g, "");
  return (alnum.slice(-24) + alnum.slice(0, 12)).slice(0, 32).padEnd(8, "x");
}

async function fetchRssFeed(feedUrl, sourceName) {
  const res = await fetch(feedUrl, {
    headers: {
      "User-Agent": "AetherNewsBot/1.0 (+https://github.com)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });
  if (!res.ok) throw new Error(`RSS ${feedUrl} HTTP ${res.status}`);
  const xml = await res.text();
  const items = [];
  const re = /<item[\s\S]*?<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const block = m[0];
    let title = extractTag(block, "title");
    let link = extractTag(block, "link");
    const description = extractTag(block, "description") || extractTag(block, "content:encoded");
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "dc:date");
    title = stripHtml(title);
    link = stripHtml(link);
    if (!title || !link) continue;
    const summary = stripHtml(description).slice(0, 320);
    const image_url = firstImgUrl(description) || "";
    let pubDateIso = new Date().toISOString();
    try {
      if (pubDate) pubDateIso = new Date(pubDate).toISOString();
    } catch {
      /* keep now */
    }
    items.push({
      title: title.slice(0, 300),
      summary: summary || null,
      image_url: image_url || null,
      url: link,
      source: sourceName,
      pubDateIso,
    });
  }
  return items;
}

const FEED_CATEGORY = "daily_feed";

async function main() {
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY。请在 .env 中配置（service_role 仅用于本脚本，勿用于网页）。"
    );
    process.exit(1);
  }

  const feeds = customFeeds
    ? customFeeds.split(",").map((u) => ({ url: u.trim(), name: "RSS" }))
    : DEFAULT_FEEDS;

  const seen = new Set();
  const merged = [];
  for (const f of feeds) {
    try {
      const rows = await fetchRssFeed(f.url, f.name);
      for (const r of rows) {
        const key = r.url;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(r);
        if (merged.length >= 24) break;
      }
    } catch (e) {
      console.warn(`跳过源 ${f.url}:`, e.message);
    }
    if (merged.length >= 24) break;
  }

  if (!merged.length) {
    console.error("未能从任何 RSS 解析到条目，请检查网络或 NEWS_RSS_URLS。");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: delErr } = await supabase.from("news_items").delete().eq("category", FEED_CATEGORY);
  if (delErr) {
    console.error("删除旧自动同步新闻失败:", delErr.message);
    process.exit(1);
  }

  const baseOrder = Math.floor(Date.now() / 1000);
  const toInsert = merged.slice(0, 15).map((r, i) => ({
    id: makeId(r.url),
    title: r.title,
    summary: r.summary,
    url: r.url,
    image_url: r.image_url,
    source: r.source,
    category: FEED_CATEGORY,
    pub_date: r.pubDateIso,
    sort_order: baseOrder - i,
  }));

  const { error: insErr } = await supabase.from("news_items").insert(toInsert);
  if (insErr) {
    console.error("插入新闻失败:", insErr.message);
    process.exit(1);
  }

  console.log(
    `已写入 ${toInsert.length} 条 RSS 新闻（category=${FEED_CATEGORY}）。其它 category 的手工数据未删除。`,
  );
}

main();

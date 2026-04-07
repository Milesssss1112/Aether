/**
 * 从根目录 config.js 读取 URL / anon key，POST 触发 Edge Function fetch-ai-news。
 * 不打印密钥。用法：node scripts/invoke-fetch-ai-news.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfgPath = path.join(root, "config.js");
const t = fs.readFileSync(cfgPath, "utf8");
const base = t.match(/supabaseUrl:\s*"([^"]+)"/)?.[1];
const key = t.match(/supabaseAnonKey:\s*"([^"]+)"/)?.[1];
if (!base || !key) {
  console.error("config.js 中缺少 supabaseUrl 或 supabaseAnonKey");
  process.exit(1);
}
const fnUrl = base.replace(/\/$/, "") + "/functions/v1/fetch-ai-news";
const res = await fetch(fnUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    apikey: key,
    "Content-Type": "application/json",
  },
  body: "{}",
});
const text = await res.text();
console.log("HTTP", res.status);
console.log(text);

/**
 * 方式 A：根目录 .env 填写 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 后执行
 *   npm run sync-supabase-config
 * 方式 B：复制本文件为 config.js 并填入 Supabase → Project Settings → API。
 * 切勿将含真实 key 的 config.js 提交到公开仓库（已加入 .gitignore）。
 */
window.AETHER_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_PUBLIC_KEY",
};

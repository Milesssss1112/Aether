# 新闻同步（教程版表结构 B）

当前前端 `aether-app.js` 已同时兼容：

- **Aether 原版**：`article_url`、`source_label`、`layout_index`、`badge`、`published_at`…
- **教程 Step 3 版（你现在的库）**：`url`、`source`、`pub_date`、`category`、`sort_order`、`id`（text）…

自动同步写入的新闻统一标记 **`category = daily_feed`**，便于替换或清理，不影响其它 `category` 的手工数据。

---

## 方式 A：`npm run sync-daily-news`（本机 / GitHub Actions）

1. `.env` 中配置 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`（**service_role**，勿用于网页）。
2. 执行：

```bash
npm run sync-daily-news
```

脚本会：删除 `category = daily_feed` 的旧行 → 从 RSS 插入新行（字段与教程表一致）。

GitHub Actions：`.github/workflows/daily-news.yml`（配置同名 Secrets）。

---

## 方式 B：Supabase Edge Function `fetch-ai-news`

仓库路径：`supabase/functions/fetch-ai-news/index.ts`  
通过 [rss2json](https://rss2json.com) 拉取若干 **AI 相关** RSS，过滤关键词后 `upsert` 到 `news_items`，并裁剪 `daily_feed` 超过 40 条的旧数据。

### 1. 安装 CLI 并登录

**不要用** `npm install -g supabase`：官方已禁止全局安装，会报错 `Installing Supabase CLI as a global module is not supported`。

任选其一：

**A. 本仓库本地安装（推荐，与其它 npm 依赖一致）**

```bash
cd d:\Curcor
npm install
npx supabase login
npx supabase link --project-ref 你的项目ref
npx supabase functions deploy fetch-ai-news --no-verify-jwt
```

也可用脚本别名：`npm run supabase -- login`（即 `npx supabase login`）。

**B. Windows：Scoop**

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
supabase login
```

**C. Windows：Chocolatey（需管理员）**

```powershell
choco install supabase
```

**D. 其它**  
见官方说明：<https://github.com/supabase/cli#install-the-cli>  

安装过程中若出现 `node-domexception@1.0.0 deprecated` 仅为依赖告警，可忽略。

### 2. 在 Dashboard 配置 Secret

**Project Settings → Edge Functions → Secrets**（名称以控制台为准）新增：

- **`SUPABASE_SERVICE_ROLE_KEY`**：与 API 页中的 **service_role** 一致（勿泄露）。

`SUPABASE_URL` 在已部署函数环境里通常由平台注入。

### 3. 部署

```bash
supabase functions deploy fetch-ai-news --no-verify-jwt
```

### 4. 定时触发

可用 **Database → Cron Jobs**（或 `pg_cron` + `net.http_post`）每天 `GET` / `POST`：

`https://<project-ref>.supabase.co/functions/v1/fetch-ai-news`  

请求头需带 `Authorization: Bearer <anon key>`（若你未对函数启用 JWT 校验，按当前 `--no-verify-jwt` 部署时部分调用方式仍可成功，具体以 Supabase 文档为准）。

---

## 依赖与合规

- **rss2json** 有免费额度；大量商用请考虑自建 RSS 解析或付费方案。
- 遵守各 RSS 源的使用条款；遇 403 可更换源或改用本仓库 `fetch-daily-news.mjs` 的直接 RSS 抓取逻辑。

---

## `makeId` 与 Edge / Node 脚本

两端对同一 `url` 生成相同风格的 **text `id`**，便于 `upsert` 去重；若需与旧行严格一致，请固定算法或改为数据库端 hash。

# Aether · Supabase 上线说明

本仓库已接入 [Supabase](https://supabase.com)：**邮箱注册/登录**、**论坛（Postgres + Realtime）**、**新闻区（表驱动 + Realtime 自动刷新）**。  
未填写 `config.js` 时，站点仍使用本地 `localStorage` 论坛与静态新闻 HTML。

## 1. 创建 Supabase 项目

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)，新建项目。
2. **Project Settings → API**：复制 **Project URL** 与 **anon public** key。
3. **推荐（与 `.env` 同步）**：在项目根目录 `.env` 中填写 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（可参考 `.env.example`），然后执行：

```bash
npm run sync-supabase-config
```

会在根目录生成（或覆盖）`config.js`，供 `home.final.html` 等静态页加载。**请勿**将含真实 key 的 `config.js` 提交到公开仓库（仓库已 `.gitignore` 忽略该文件）。

4. **或手动**：将 `config.example.js` 复制为 `config.js` 并填入：

```js
window.AETHER_CONFIG = {
  supabaseUrl: "https://xxxx.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
};
```

## 2. 数据库与 RLS

1. 打开 **SQL Editor**，执行仓库内 `supabase/migrations/001_init.sql` 全文（含 `profiles` 表与 `on_auth_user_created` 触发器，注册后自动写入显示名）。
2. 若 `alter publication supabase_realtime add table ...` 报错「already member」，可忽略对应行（表已在 Realtime 中）。
3. 种子新闻仅在 `news_items` **为空**时插入；之后可在 **Table Editor** 或 SQL 中维护新闻（匿名客户端无法 INSERT/UPDATE，需用 Dashboard 或 **service_role**）。

## 3. 身份验证（准备上线）

1. **Authentication → URL configuration**  
   - **Site URL**：生产域名，例如 `https://your-domain.com`。  
   - **Redirect URLs**：加入 `https://your-domain.com/**` 与本地调试 `http://localhost:*/**`（按需）。
2. 若希望注册后**无需邮箱确认**即可登录（仅测试环境）：**Authentication → Providers → Email** 中关闭 **Confirm email**；生产环境建议开启并配置 SMTP。
3. 部署站点请使用 **HTTPS**，以便安全写入 Cookie / PKCE。

## 4. 静态资源与 CDN

- 页面通过 `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.js` 加载客户端。若 404，可在 `home.html` 中改为 [unpkg](https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js) 或其它可用版本。
- **切勿**把 `service_role` key 写进前端；仅使用 **anon** key，权限由 RLS 约束。

## 5. 行为说明

| 功能 | 说明 |
|------|------|
| 登录 / 注册 | 邮箱 + 密码；注册时可填显示名（写入 `profiles`）。 |
| 论坛 | 帖子、评论存库；列表与详情需登录发帖/评论；Realtime 推送列表刷新。 |
| 新闻 | 自 `news_items` 读取并按 `layout_index` 排版；表变更时 Realtime 触发前端重绘。**每日自动写入真实稿**见 [README-NEWS-SYNC.md](./README-NEWS-SYNC.md)（`npm run sync-daily-news` + service_role）。 |
| 清空按钮 | 使用 Supabase 时隐藏（避免误删全站数据）。 |

## 6. 部署检查清单

- [ ] 已从 `.env` 运行 `npm run sync-supabase-config` 生成 `config.js`，或已手动填写 `config.js`；仅部署到可信环境（anon key 仍属公开，依赖 RLS）。  
- [ ] Supabase **Site URL / Redirect URLs** 与真实域名一致。  
- [ ] 生产环境开启邮箱确认或企业 SMTP（按需）。  
- [ ] 内容安全策略（CSP）若启用，需允许 `cdn.jsdelivr.net`、`*.supabase.co` 等。

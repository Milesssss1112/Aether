# Aether（静态站点）

GitHub Pages 的**站点首页**为根目录下的 `index.html`（内容与 `home.final.html` 一致）。

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库（例如 `aether-site`），**不要**勾选「Add README」（若本地已有代码）。
2. 在本目录执行（将 `YOUR_USER` / `YOUR_REPO` 换成你的）：

   ```powershell
   cd D:\Curcor
   git init
   git add .
   git commit -m "Initial site for GitHub Pages"
   git branch -M main
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git push -u origin main
   ```

3. 打开 GitHub 仓库 → **Settings** → **Pages** → **Build and deployment** → Source 选 **Deploy from a branch**，Branch 选 **`main`**，文件夹选 **`/ (root)`**，保存。
4. 约 1～2 分钟后访问：

   `https://YOUR_USER.github.io/YOUR_REPO/`

   打开即为 `index.html`（与 `home.final.html` 相同内容）。

## 以后改首页

1. 编辑 `home.final.html`。
2. 覆盖复制到 `index.html`：

   ```powershell
   Copy-Item -Path .\home.final.html -Destination .\index.html -Force
   ```

3. `git add -A` → `git commit` → `git push`。

## 安全说明

`config.js` 内含 Supabase **anon** 公钥。anon 本身设计为可在浏览器暴露，但请务必在 [Supabase 控制台](https://supabase.com/dashboard) 为各表配置 **RLS（行级安全）**。若仓库为**公开**，请勿把**服务角色密钥**或数据库密码写入仓库。

## 本地预览

用任意静态服务器打开本目录即可，例如：

```powershell
npx --yes serve .
```

然后访问提示的本地地址（默认常包含 `index.html` 作为目录首页）。

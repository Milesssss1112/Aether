# 本地预览约定（给 Claude / 协作者）

目标：改完 `learn` / 教程相关文件后，用户用 **右键 HTML → 用浏览器打开（`file://`）** 或 **localhost** 都能立刻看到一致内容。

## 1. 教程数据文件

- 主数据：`data/learn-content.json`（列表 + 详情正文）
- 列表页：`learn.html`
- 详情页：`article.html?slug=xxx`
- 逻辑：`learn.js`（**不要**再用「URL 里必须带 `article.html` 字符串」判断详情页，应依据页面是否存在 `#articleMount`）

## 2. 用户用 `file://`（双击 / 右键浏览器打开）时

浏览器通常会 **禁止** `fetch` 读取本地 `learn-content.json`，因此必须保留：

1. `learn.html` 与 `article.html` 中，在 `learn.js` **之前**引入：  
   `<script src="./learn-content.js"></script>`
2. `learn-content.js` 内容为：  
   `window.AETHER_LEARN_CONTENT = <与 JSON 同步的对象>;`

**每次只改了 `data/learn-content.json` 后**，必须在仓库根目录执行下面命令之一，再让用户刷新：

```bash
cd /d d:\Curcor
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('data/learn-content.json','utf8'));fs.writeFileSync('learn-content.js','window.AETHER_LEARN_CONTENT = '+JSON.stringify(d)+';');console.log('learn-content.js OK');"
```

或使用 npm（若已配置脚本 `sync-learn-content`）：

```bash
npm run sync-learn-content
```

然后让用户 **Ctrl+F5** 硬刷新，避免缓存旧 JS。

## 3. 用户用 `http://localhost:xxxx/` 时

- `fetch('./data/learn-content.json')` 一般可用，`learn.js` 会优先用 JSON；仍建议保留 `learn-content.js` 作为回退。
- 若项目根目录的 `index.html` 是 **Vite/React** 入口，**不要**让用户只打开 `http://localhost:3000/` 当静态站；静态页应打开：  
  `http://localhost:3000/learn.html`、  
  `http://localhost:3000/article.html?slug=...`
- 详情页白屏时：检查是否误用「路径必须包含 `article.html`」；应改为根据 DOM（`#articleMount` / `#learnListMount`）分支。

## 4. 改完自检清单（Claude 交付前）

- [ ] `data/learn-content.json` 为合法 JSON（无尾逗号、引号一致）
- [ ] 已同步生成 `learn-content.js`（若用户主要用 file://）
- [ ] `article.html` 含 `articleMount`，且引入顺序：`tools.js` → `learn-content.js` → `learn.js`
- [ ] 在浏览器打开一篇详情 `article.html?slug=已知slug` 有正文，非白屏

# Aether 本地 AI 代理（推荐方案 B）

目的：**不把 API Key 暴露在前端**。网页只请求本机代理，本机代理再携带 Key 转发到上游（OpenAI / OpenAI-兼容）。

## 需求

- Node.js **18+**（需要内置 `fetch`）

## 启动（Windows PowerShell）

在 `d:\Curcor\server` 目录打开 PowerShell，执行：

```powershell
# 1) 设置你的 Key（当前窗口有效）
$env:OPENAI_API_KEY="sk-xxxx"

# 2) 可选：切换上游（默认 https://api.openai.com/v1）
# $env:UPSTREAM_BASE_URL="https://api.openai.com/v1"

# 3) 可选：端口（默认 8787）
# $env:PORT="8787"

# 4) 启动
node .\server.js
```

看到类似输出表示启动成功：

```text
[aether-proxy] listening on http://localhost:8787
[aether-proxy] upstream: https://api.openai.com/v1
```

## 前端如何配置

打开网页右下角 **AI → 设置**：

- **接口 Base URL**：填 `http://localhost:8787/v1`
- **模型**：例如 `gpt-4o-mini`
- **API Key**：可以留空（由本地代理注入）

## 安全说明

- Key 只在你本机环境变量中，不写入网页。
- 代理开启了 CORS（`Access-Control-Allow-Origin: *`），仅建议在本机使用。


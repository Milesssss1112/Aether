/**
 * Aether 本地代理（OpenAI 兼容）
 *
 * - 前端请求：   http://localhost:8787/v1/chat/completions
 * - 代理转发到：UPSTREAM_BASE_URL（默认 https://api.openai.com/v1）
 * - 由本地环境变量注入 OPENAI_API_KEY，避免把 Key 暴露到前端
 *
 * 依赖：Node.js 18+（内置 fetch），无第三方依赖
 */

const http = require("http");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 8787);
const UPSTREAM_BASE_URL = (process.env.UPSTREAM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

function json(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  });
  res.end(data);
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function isAllowedPath(pathname) {
  return pathname === "/v1/chat/completions";
}

const server = http.createServer(async (req, res) => {
  try {
    setCors(res);

    const u = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== "POST" || !isAllowedPath(u.pathname)) {
      json(res, 404, { error: { message: "Not found" } });
      return;
    }

    if (!OPENAI_API_KEY) {
      json(res, 500, {
        error: {
          message:
            "OPENAI_API_KEY 未设置。请在启动服务前设置环境变量 OPENAI_API_KEY（参见 server/README.md）。",
        },
      });
      return;
    }

    const raw = await readBody(req);
    let payload = null;
    try {
      payload = JSON.parse(raw.toString("utf-8") || "{}");
    } catch {
      json(res, 400, { error: { message: "Invalid JSON body" } });
      return;
    }

    const upstreamUrl = `${UPSTREAM_BASE_URL}/chat/completions`;
    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await upstreamRes.text();
    res.statusCode = upstreamRes.status;
    res.setHeader("Content-Type", upstreamRes.headers.get("content-type") || "application/json; charset=utf-8");
    res.end(text);
  } catch (err) {
    json(res, 500, { error: { message: String(err?.message || err || "Unknown error") } });
  }
});

server.listen(PORT, () => {
  console.log(`[aether-proxy] listening on http://localhost:${PORT}`);
  console.log(`[aether-proxy] upstream: ${UPSTREAM_BASE_URL}`);
});


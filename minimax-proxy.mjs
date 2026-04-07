/**
 * 浏览器直连 MiniMax 常遇 CORS 拦截。本地运行本代理后，在网站 AI 设置里将 Base URL 设为：
 *   http://127.0.0.1:8788/anthropic
 * 模型仍填 MiniMax-M2.7，Key 填你的 API Key（仅在你本机与 MiniMax 之间传递）。
 *
 * 运行：node minimax-proxy.mjs
 */
import http from "http";
import https from "https";

const PORT = 8788;
const UPSTREAM = "api.minimaxi.com";

function pipeHeaders(up) {
  const h = { ...up.headers };
  delete h["transfer-encoding"];
  h["access-control-allow-origin"] = "*";
  return h;
}

http
  .createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          req.headers["access-control-request-headers"] ||
          "content-type, x-api-key, anthropic-version, authorization",
        "Access-Control-Max-Age": "86400",
      });
      res.end();
      return;
    }

    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const path = req.url || "/";
      const opt = {
        hostname: UPSTREAM,
        port: 443,
        path,
        method: req.method,
        headers: {
          host: UPSTREAM,
          "content-type": req.headers["content-type"] || "application/json",
          "x-api-key": req.headers["x-api-key"] || "",
          "anthropic-version": req.headers["anthropic-version"] || "2023-06-01",
        },
      };
      if (body.length) opt.headers["content-length"] = String(body.length);

      const p = https.request(opt, (up) => {
        res.writeHead(up.statusCode || 502, pipeHeaders(up));
        up.pipe(res);
      });
      p.on("error", (e) => {
        res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" });
        res.end("Proxy error: " + e.message);
      });
      p.write(body);
      p.end();
    });
  })
  .listen(PORT, () => {
    console.log(`MiniMax Anthropic 兼容代理: http://127.0.0.1:${PORT}`);
    console.log(`网页 AI 设置 Base URL 填: http://127.0.0.1:${PORT}/anthropic`);
  });

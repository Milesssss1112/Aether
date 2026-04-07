import { useState, useCallback } from 'react';

/**
 * useRecommendations
 * 根据用户消息调用 Supabase Edge Function /recommend，返回推荐工具和教程。
 *
 * 用法：
 *   const { tools, tutorials, loading, error, recommend } = useRecommendations();
 *   await recommend("I want to make an AI video");
 */

// 从全局 config.js 读取 Supabase URL（与现有项目保持一致）
function getEdgeFunctionUrl() {
  const base = window.AETHER_CONFIG?.supabaseUrl ?? '';
  return `${base}/functions/v1/recommend`;
}

export function useRecommendations() {
  const [tools, setTools] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recommend = useCallback(async (message) => {
    const msg = String(message ?? '').trim();
    if (!msg) return;

    setLoading(true);
    setError(null);

    try {
      const url = getEdgeFunctionUrl();
      const anonKey = window.AETHER_CONFIG?.supabaseAnonKey ?? '';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // anon key 用于 Edge Function 鉴权（函数部署时加了 --no-verify-jwt 则可省略）
          ...(anonKey ? { Authorization: `Bearer ${anonKey}` } : {}),
        },
        body: JSON.stringify({ message: msg }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(text);
      }

      const data = await res.json();
      setTools(data.tools ?? []);
      setTutorials(data.tutorials ?? []);
    } catch (err) {
      setError(String(err?.message ?? err));
      setTools([]);
      setTutorials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setTools([]);
    setTutorials([]);
    setError(null);
  }, []);

  return { tools, tutorials, loading, error, recommend, reset };
}

import toolsRaw from "./tools.json";
import toolsMoreRaw from "./tools.more.json";

export type ToolPricing = "free" | "paid" | "freemium";
export type ToolCategorySlug =
  | "writing"
  | "drawing"
  | "video"
  | "coding"
  | "audio"
  | "office"
  | "design"
  | "data";

export type Tool = {
  id: string;
  name: string;
  slug: string;
  officialUrl: string;
  description: string;
  categories: ToolCategorySlug[];
  tags: string[];
  pricing: ToolPricing;
  coverUrl?: string;
  logoUrl?: string;
  hotScore: number;
  createdAt: string; // ISO date string (YYYY-MM-DD)
};

export const tools: Tool[] = [...(toolsRaw as Tool[]), ...(toolsMoreRaw as Tool[])];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

function extractDomain(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * 在数据不提供 cover/logo 时，基于官方域名生成更“像真实 Logo”的方形图。
 * 同时提供 dicebear 兜底，避免外部图片源不可用导致坏图。
 */
export function getLogoUrl(tool: Tool): string {
  if (tool.logoUrl) return tool.logoUrl;
  const domain = extractDomain(tool.officialUrl);
  if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(tool.name)}&backgroundColor=0b1220&scale=120`;
}

export function getCoverUrl(tool: Tool): string {
  if (tool.coverUrl) return tool.coverUrl;
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(tool.name)}&backgroundColor=0b1020,111933,1f2d5a,2b65ff&shape1Color=4c8dff&shape2Color=18c8ff&shape3Color=a855f7`;
}

export function formatPricingLabel(pricing: ToolPricing) {
  if (pricing === "free") return { label: "免费", tone: "free" as const };
  if (pricing === "paid") return { label: "付费", tone: "paid" as const };
  return { label: "免费/付费", tone: "freemium" as const };
}


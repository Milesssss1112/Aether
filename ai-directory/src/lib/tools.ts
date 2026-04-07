export type PriceType = "免费" | "付费" | "免费试用";

export type ToolItem = {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  tags: string[];
  priceType: PriceType;
  url: string;
  hot: number;
  createdAt: string;
};

export const galaxyDomains = [
  {
    id: "text",
    name: "文本创造域",
    description: "写作、办公、知识工作流",
  },
  {
    id: "visual",
    name: "视觉生成域",
    description: "绘画、设计、视频生成",
  },
  {
    id: "dev",
    name: "开发智能域",
    description: "代码、数据、自动化流程",
  },
] as const;

export const starClusters = [
  "AI写作",
  "AI绘画",
  "AI视频",
  "AI代码",
  "AI音频",
  "AI设计",
  "AI办公",
  "AI数据",
] as const;

export const tools: ToolItem[] = [
  { id: "chatgpt", name: "ChatGPT", logo: "/logos/chatgpt.svg", description: "通用对话、创意写作与工作流助手。", category: "AI写作", tags: ["写作", "对话"], priceType: "免费试用", url: "https://chatgpt.com/", hot: 98, createdAt: "2026-01-10" },
  { id: "claude", name: "Claude", logo: "/logos/claude.svg", description: "长文本推理与知识整理能力突出。", category: "AI写作", tags: ["知识", "办公"], priceType: "免费试用", url: "https://claude.ai/", hot: 92, createdAt: "2026-02-01" },
  { id: "midjourney", name: "Midjourney", logo: "/logos/midjourney.svg", description: "高质量艺术风格图像生成。", category: "AI绘画", tags: ["绘画", "艺术"], priceType: "付费", url: "https://www.midjourney.com/", hot: 95, createdAt: "2025-11-18" },
  { id: "ideogram", name: "Ideogram", logo: "/logos/ideogram.svg", description: "字形排版与图像融合能力优秀。", category: "AI设计", tags: ["设计", "海报"], priceType: "免费试用", url: "https://ideogram.ai/", hot: 87, createdAt: "2026-01-20" },
  { id: "runway", name: "Runway", logo: "/logos/runway.svg", description: "视频生成、编辑与特效生产平台。", category: "AI视频", tags: ["视频", "剪辑"], priceType: "免费试用", url: "https://runwayml.com/", hot: 93, createdAt: "2025-12-05" },
  { id: "suno", name: "Suno", logo: "/logos/suno.svg", description: "文本到音乐，快速生成完整歌曲。", category: "AI音频", tags: ["音乐", "音频"], priceType: "免费试用", url: "https://suno.com/", hot: 88, createdAt: "2026-01-03" },
  { id: "cursor", name: "Cursor", logo: "/logos/cursor.svg", description: "AI 原生代码编辑器，提效显著。", category: "AI代码", tags: ["编程", "IDE"], priceType: "免费试用", url: "https://www.cursor.com/", hot: 94, createdAt: "2026-02-08" },
  { id: "github-copilot", name: "GitHub Copilot", logo: "/logos/copilot.svg", description: "代码补全与 Agent 协作开发。", category: "AI代码", tags: ["开发", "自动化"], priceType: "付费", url: "https://github.com/features/copilot", hot: 90, createdAt: "2025-12-28" },
  { id: "notion-ai", name: "Notion AI", logo: "/logos/notion.svg", description: "文档组织、总结与任务推进。", category: "AI办公", tags: ["办公", "协作"], priceType: "免费试用", url: "https://www.notion.so/product/ai", hot: 84, createdAt: "2025-10-16" },
  { id: "zapier-ai", name: "Zapier AI", logo: "/logos/zapier.svg", description: "自动化流程编排与跨平台连接。", category: "AI办公", tags: ["流程", "自动化"], priceType: "免费试用", url: "https://zapier.com/ai", hot: 81, createdAt: "2025-11-22" },
  { id: "tableau-pulse", name: "Tableau Pulse", logo: "/logos/tableau.svg", description: "智能洞察与业务数据摘要。", category: "AI数据", tags: ["BI", "数据"], priceType: "付费", url: "https://www.tableau.com/products/pulse", hot: 78, createdAt: "2025-09-30" },
  { id: "perplexity", name: "Perplexity", logo: "/logos/perplexity.svg", description: "面向检索与事实问答的 AI 引擎。", category: "AI数据", tags: ["检索", "研究"], priceType: "免费试用", url: "https://www.perplexity.ai/", hot: 89, createdAt: "2026-01-14" },
];

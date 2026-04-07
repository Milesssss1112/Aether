export type ToolCategorySlug =
  | "writing"
  | "drawing"
  | "video"
  | "coding"
  | "audio"
  | "office"
  | "design"
  | "data";

export type ToolCategory = {
  slug: ToolCategorySlug;
  name: string;
  description: string;
};

export const categories: ToolCategory[] = [
  {
    slug: "writing",
    name: "AI 写作",
    description: "文章、脚本、文案、润色与多语言创作。",
  },
  {
    slug: "drawing",
    name: "AI 绘画",
    description: "生成式绘图、风格迁移、提示词与配图。",
  },
  {
    slug: "video",
    name: "AI 视频",
    description: "视频生成、剪辑辅助、字幕与风格化处理。",
  },
  {
    slug: "coding",
    name: "AI 代码",
    description: "代码生成、补全、解释与自动化工作流。",
  },
  {
    slug: "audio",
    name: "AI 音频",
    description: "配音、音色克隆、音乐生成与音频处理。",
  },
  {
    slug: "office",
    name: "AI 办公",
    description: "邮件、PPT、表格与知识管理提效。",
  },
  {
    slug: "design",
    name: "AI 设计",
    description: "海报、Logo、UI 辅助与创意素材生成。",
  },
  {
    slug: "data",
    name: "AI 数据",
    description: "数据分析、可视化、检索与智能问答。",
  },
];

export const categoryNamesBySlug: Record<ToolCategorySlug, string> = Object.fromEntries(
  categories.map((c) => [c.slug, c.name])
) as Record<ToolCategorySlug, string>;


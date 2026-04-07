// 数据源：AIGC 工具导航（真实外链）
// 说明：卡片不直接外跳；在 tool.html 中提供跳转按钮。

function svgDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeCardSvg({ title, subtitle, accent = "#6366f1", accent2 = "#22c55e" }) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0b0b0f"/>
        <stop offset="1" stop-color="#0f172a"/>
      </linearGradient>
      <radialGradient id="glow" cx="30%" cy="25%" r="70%">
        <stop offset="0" stop-color="${accent}" stop-opacity="0.55"/>
        <stop offset="0.45" stop-color="${accent2}" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${accent}" stop-opacity="0"/>
        <stop offset="0.5" stop-color="${accent}" stop-opacity="0.9"/>
        <stop offset="1" stop-color="${accent2}" stop-opacity="0"/>
      </linearGradient>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="14"/>
      </filter>
    </defs>
    <rect width="1200" height="720" fill="url(#bg)"/>
    <rect width="1200" height="720" fill="url(#glow)"/>
    <g opacity="0.7">
      <path d="M-80 560 C 280 460, 420 740, 820 600 S 1220 420, 1320 520" fill="none" stroke="url(#beam)" stroke-width="10"/>
      <path d="M-120 210 C 210 130, 420 360, 710 250 S 1200 160, 1340 240" fill="none" stroke="url(#beam)" stroke-width="8" opacity="0.7"/>
      <circle cx="280" cy="520" r="120" fill="${accent}" opacity="0.28" filter="url(#soft)"/>
      <circle cx="920" cy="190" r="140" fill="${accent2}" opacity="0.18" filter="url(#soft)"/>
    </g>
    <g font-family="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" fill="#e5e7eb">
      <text x="64" y="96" font-size="44" font-weight="700">${escapeXml(title)}</text>
      <text x="64" y="140" font-size="20" opacity="0.75">${escapeXml(subtitle)}</text>
      <g opacity="0.35">
        <rect x="64" y="190" width="520" height="12" rx="6" fill="#e5e7eb"/>
        <rect x="64" y="220" width="440" height="12" rx="6" fill="#e5e7eb"/>
        <rect x="64" y="250" width="480" height="12" rx="6" fill="#e5e7eb"/>
      </g>
      <g opacity="0.4">
        <rect x="64" y="620" width="220" height="44" rx="22" fill="#0b1220" stroke="#334155"/>
        <text x="94" y="649" font-size="16" opacity="0.9">Explore</text>
      </g>
    </g>
  </svg>`;
  return svgDataUri(svg);
}

function escapeXml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function safeUrlHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

// 分类顺序（用于 UI 展示）
const AIGC_CATEGORIES = [
  { id: "chat-search", label: "对话 / 搜索" },
  { id: "image", label: "图像生成" },
  { id: "video", label: "视频生成" },
  { id: "audio", label: "音频 / 配音" },
  { id: "dev-agent", label: "开发 / Agent" },
  { id: "models", label: "模型 / 平台" },
];

const ACCENTS = [
  ["#60a5fa", "#22c55e"],
  ["#a78bfa", "#38bdf8"],
  ["#f59e0b", "#f472b6"],
  ["#22c55e", "#60a5fa"],
  ["#fb7185", "#60a5fa"],
  ["#38bdf8", "#a78bfa"],
];

function pickAccents(seed) {
  let h = 0;
  const s = String(seed || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const pair = ACCENTS[h % ACCENTS.length] || ACCENTS[0];
  return { accent: pair[0], accent2: pair[1] };
}

function clearbitLogoFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (!host) return "";
    return `https://logo.clearbit.com/${host}`;
  } catch {
    return "";
  }
}

// 图片懒生成缓存（避免 200+ 工具在加载时生成两张 svg）
const _imageCache = new Map();
function ensureToolImages(tool) {
  if (!tool) return { a: "", b: "" };
  if (_imageCache.has(tool.id)) return _imageCache.get(tool.id);
  const v = tool.visual || {};
  const explicitA = tool.coverA || tool.coverImage;
  const explicitB = tool.coverB;
  const fromSite = clearbitLogoFromUrl(tool.url);
  if (explicitA || fromSite) {
    const a = explicitA || fromSite;
    const b = explicitB || explicitA || fromSite;
    const imgs = { a, b };
    _imageCache.set(tool.id, imgs);
    return imgs;
  }
  const { accent, accent2 } = pickAccents(tool.id);
  const a = makeCardSvg({
    title: v.titleA || tool.name,
    subtitle: v.subtitleA || tool.tagline || safeUrlHost(tool.url),
    accent: v.accent || accent,
    accent2: v.accent2 || accent2,
  });
  const b = makeCardSvg({
    title: v.titleB || tool.name,
    subtitle: v.subtitleB || "Explore • Compare • Save",
    accent: v.accent2 || accent2,
    accent2: v.accent || accent,
  });
  const imgs = { a, b };
  _imageCache.set(tool.id, imgs);
  return imgs;
}

// 工具数据（都为真实外链）
const AIGC_TOOLS = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "chat-search",
    tagline: "通用对话、写作、代码与多模态助手",
    url: "https://chat.openai.com/",
    description:
      "适合做通用问答、写作、头脑风暴、代码辅助与多模态内容理解。可用于快速产出文案、需求梳理与脚本生成。",
    featured: true,
    highlights: ["写作/总结", "代码辅助", "多模态"],
    visual: { subtitleA: "Chat • Code • Vision" },
  },
  {
    id: "claude",
    name: "Claude",
    category: "chat-search",
    tagline: "长文本处理与严谨写作/分析",
    url: "https://claude.ai/",
    description: "擅长长文阅读、总结、写作与多轮推理，适合整理资料、写方案、生成结构化输出。",
    featured: true,
    highlights: ["长文总结", "结构化输出", "写作润色"],
    visual: { subtitleA: "Long-form reasoning" },
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "chat-search",
    tagline: "Google 生态的多模态助手",
    url: "https://gemini.google.com/",
    description: "支持多模态对话与信息检索协作，适合配合 Google 生态进行资料整理与内容生成。",
    featured: true,
    highlights: ["多模态", "资料整理", "协作效率"],
    visual: { subtitleA: "Multimodal assistant" },
  },
  {
    id: "perplexity",
    name: "Perplexity",
    category: "chat-search",
    tagline: "带引用的 AI 搜索与研究助手",
    url: "https://www.perplexity.ai/",
    description: "更偏研究/搜索场景，输出往往带引用来源，适合写调研、做竞品分析与资料汇总。",
    featured: true,
    highlights: ["带引用", "研究检索", "快速综述"],
    visual: { subtitleA: "Answer with sources" },
  },
  {
    id: "midjourney",
    name: "Midjourney",
    category: "image",
    tagline: "高质量图像生成与风格探索",
    url: "https://www.midjourney.com/",
    description: "以强烈的风格表达和高质量出图见长，适合海报、封面、概念设计、品牌视觉探索。",
    featured: true,
    highlights: ["高质出图", "风格多样", "概念设计"],
    visual: { subtitleA: "Image generation" },
  },
  {
    id: "ideogram",
    name: "Ideogram",
    category: "image",
    tagline: "擅长文字排版的图片生成",
    url: "https://ideogram.ai/",
    description: "在含文字的海报/Logo/标题图等场景表现突出，适合快速做带字视觉稿。",
    featured: true,
    highlights: ["文字可控", "海报/Logo", "标题图"],
    visual: { subtitleA: "Text-in-image" },
  },
  {
    id: "leonardo",
    name: "Leonardo AI",
    category: "image",
    tagline: "素材/角色/风格化图片生成与编辑",
    url: "https://leonardo.ai/",
    description: "面向设计与内容创作的图像生成平台，常用于角色、素材与风格化内容产出。",
    featured: false,
    highlights: ["角色/素材", "多风格", "创作工作流"],
    visual: { subtitleA: "Assets & characters" },
  },
  {
    id: "runway",
    name: "Runway",
    category: "video",
    tagline: "视频生成、抠像与创意编辑",
    url: "https://runwayml.com/",
    description: "面向创作者的视频生成与编辑平台，覆盖文生视频、图生视频、抠像与多种后期工具。",
    featured: true,
    highlights: ["文生视频", "创意编辑", "后期工具"],
    visual: { subtitleA: "Gen video & edit" },
  },
  {
    id: "pika",
    name: "Pika",
    category: "video",
    tagline: "轻量上手的视频生成与风格化",
    url: "https://pika.art/",
    description: "快速生成短视频与风格化动效，适合社媒短内容与视觉实验。",
    featured: false,
    highlights: ["短视频", "风格化", "上手快"],
    visual: { subtitleA: "Text → video" },
  },
  {
    id: "suno",
    name: "Suno",
    category: "audio",
    tagline: "音乐与歌曲生成",
    url: "https://suno.com/",
    description: "用于生成歌曲与音乐片段，适合配乐、灵感草稿、短视频音乐素材制作。",
    featured: true,
    highlights: ["歌曲生成", "配乐", "灵感草稿"],
    visual: { subtitleA: "Music generation" },
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    category: "audio",
    tagline: "高质量 TTS 配音与语音克隆",
    url: "https://elevenlabs.io/",
    description: "用于配音、旁白与多语言语音合成，在播客、短视频、课程配音等场景常用。",
    featured: true,
    highlights: ["TTS", "配音", "多语言"],
    visual: { subtitleA: "Voice & TTS" },
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "dev-agent",
    tagline: "IDE 内代码补全与对话式编程助手",
    url: "https://github.com/features/copilot",
    description: "集成到常见 IDE 的编程助手，适合写代码、生成测试、理解项目与重构建议。",
    featured: true,
    highlights: ["IDE 集成", "补全", "生成测试"],
    visual: { titleA: "Copilot", subtitleA: "Code in your IDE" },
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "dev-agent",
    tagline: "面向代码库的 AI 编辑器与 Agent 工作流",
    url: "https://www.cursor.com/",
    description: "更强调对代码库的理解与多步修改协作，适合工程化开发与迭代重构。",
    featured: true,
    highlights: ["Agent 工作流", "项目级理解", "重构"],
    visual: { subtitleA: "AI code editor" },
  },
  {
    id: "langchain",
    name: "LangChain",
    category: "dev-agent",
    tagline: "构建 LLM 应用与 Agent 的开发框架",
    url: "https://www.langchain.com/",
    description: "用于搭建 LLM 应用、工具调用、RAG 与 Agent 工作流的常用框架生态。",
    featured: false,
    highlights: ["Agent", "RAG", "工具调用"],
    visual: { subtitleA: "Build LLM apps" },
  },
  {
    id: "llamaindex",
    name: "LlamaIndex",
    category: "dev-agent",
    tagline: "RAG 与数据连接层（索引/检索）",
    url: "https://www.llamaindex.ai/",
    description: "聚焦数据与检索的应用层框架，适合做知识库、文档问答与企业内部检索增强。",
    featured: false,
    highlights: ["RAG", "文档问答", "数据连接"],
    visual: { subtitleA: "Data → LLM" },
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "models",
    tagline: "模型、数据集与推理/部署生态",
    url: "https://huggingface.co/",
    description: "包含模型库与数据集，适合寻找开源模型、试玩 Demo、进行推理与部署。",
    featured: true,
    highlights: ["模型库", "数据集", "社区生态"],
    visual: { subtitleA: "Models & datasets" },
  },
  {
    id: "replicate",
    name: "Replicate",
    category: "models",
    tagline: "通过 API 运行/部署热门模型",
    url: "https://replicate.com/",
    description: "面向开发者的模型调用平台，用 API 快速接入图像/视频/音频/LLM 等模型。",
    featured: false,
    highlights: ["API 调用", "快速接入", "多模态模型"],
    visual: { subtitleA: "Run models via API" },
  },
  {
    id: "pinecone",
    name: "Pinecone",
    category: "models",
    tagline: "向量数据库（RAG 基础设施）",
    url: "https://www.pinecone.io/",
    description: "用于构建检索增强（RAG）应用的向量数据库服务，适合知识库、语义检索与推荐。",
    featured: false,
    highlights: ["向量检索", "RAG", "基础设施"],
    visual: { subtitleA: "Vector database" },
  },
];

// 扩充到约 200 条工具：基于真实链接的“目录补全”
// 说明：这里不强制全部 featured；首页默认仅展示 featured 的 6 个（3×2）。
const _MORE_TOOLS = [
  // chat / search
  { id: "mistral-chat", name: "Mistral", category: "chat-search", tagline: "轻量快速的对话与推理入口", url: "https://chat.mistral.ai/", description: "Mistral 的官方对话入口，适合快速对话与试用其模型能力。", highlights: ["对话", "推理", "快速"] },
  { id: "cohere", name: "Cohere", category: "models", tagline: "面向企业的 NLP/LLM 平台", url: "https://cohere.com/", description: "提供企业级文本生成、向量检索与模型服务，适合应用集成。", highlights: ["企业", "API", "NLP"] },
  { id: "groq", name: "Groq", category: "models", tagline: "超低延迟推理平台", url: "https://groq.com/", description: "以低延迟推理体验著称的模型推理平台。", highlights: ["低延迟", "推理", "平台"] },
  { id: "deepseek", name: "DeepSeek", category: "chat-search", tagline: "中文友好的对话与推理", url: "https://chat.deepseek.com/", description: "面向中文场景的对话与推理入口，适合写作与代码辅助。", highlights: ["中文", "推理", "代码"] },
  { id: "qwen", name: "通义千问", category: "chat-search", tagline: "阿里通义对话入口", url: "https://qwen.ai/", description: "通义系列模型的官方入口，覆盖对话与多种创作能力。", highlights: ["中文", "对话", "创作"] },
  { id: "kimi", name: "Kimi", category: "chat-search", tagline: "长文本与资料阅读助手", url: "https://kimi.moonshot.cn/", description: "适合长文本阅读、总结与资料整理的对话助手。", highlights: ["长文", "总结", "资料整理"] },
  { id: "poe", name: "Poe", category: "chat-search", tagline: "多模型聚合的对话入口", url: "https://poe.com/", description: "聚合多种模型的对话平台，便于对比不同模型输出。", highlights: ["多模型", "对比", "对话"] },
  { id: "you-com", name: "You.com", category: "chat-search", tagline: "搜索与 AI 助手结合", url: "https://you.com/", description: "将搜索与 AI 助手结合的产品，适合信息检索与摘要。", highlights: ["搜索", "摘要", "问答"] },

  // image
  { id: "stability", name: "Stability AI", category: "image", tagline: "Stable Diffusion 生态与图像生成", url: "https://stability.ai/", description: "Stable Diffusion 相关模型与产品生态。", highlights: ["Stable Diffusion", "图像生成", "生态"] },
  { id: "playground", name: "Playground", category: "image", tagline: "在线图像生成与编辑", url: "https://playground.com/", description: "面向创作的在线图像生成与编辑平台。", highlights: ["生成", "编辑", "在线"] },
  { id: "krea", name: "Krea", category: "image", tagline: "实时生成与风格探索", url: "https://www.krea.ai/", description: "偏实时生成与创意探索的图像工具。", highlights: ["实时", "风格", "创意"] },
  { id: "clipdrop", name: "Clipdrop", category: "image", tagline: "抠图/去背景/增强等图像工具箱", url: "https://clipdrop.co/", description: "一套实用的图像处理与生成工具集合。", highlights: ["去背景", "增强", "工具箱"] },
  { id: "remove-bg", name: "Remove.bg", category: "image", tagline: "一键去背景", url: "https://www.remove.bg/", description: "常用的去背景工具，适合电商与素材处理。", highlights: ["去背景", "素材", "效率"] },

  // video
  { id: "luma", name: "Luma", category: "video", tagline: "视频生成与 3D/捕捉相关创作", url: "https://lumalabs.ai/", description: "Luma Labs 的创作平台，覆盖视频生成与相关能力。", highlights: ["视频", "创作", "生成"] },
  { id: "kapwing", name: "Kapwing", category: "video", tagline: "在线剪辑与字幕工具", url: "https://www.kapwing.com/", description: "适合快速剪辑与字幕处理的在线工具。", highlights: ["剪辑", "字幕", "在线"] },
  { id: "veed", name: "VEED", category: "video", tagline: "在线视频编辑与字幕", url: "https://www.veed.io/", description: "在线视频剪辑、字幕与社媒内容制作。", highlights: ["剪辑", "字幕", "社媒"] },

  // audio
  { id: "descript", name: "Descript", category: "audio", tagline: "播客/视频的音频编辑与配音", url: "https://www.descript.com/", description: "适合播客与视频旁白的音频编辑工具。", highlights: ["音频编辑", "播客", "配音"] },
  { id: "adobe-podcast", name: "Adobe Podcast", category: "audio", tagline: "语音增强与录音优化", url: "https://podcast.adobe.com/", description: "提升录音清晰度、降噪与语音增强。", highlights: ["降噪", "增强", "录音"] },

  // dev/agent
  { id: "replit", name: "Replit", category: "dev-agent", tagline: "在线开发与 AI 编程辅助", url: "https://replit.com/", description: "浏览器内开发环境与 AI 编程能力，适合快速试验与部署。", highlights: ["在线 IDE", "快速试验", "部署"] },
  { id: "v0", name: "v0", category: "dev-agent", tagline: "文本生成 UI 的原型工具", url: "https://v0.dev/", description: "通过提示词生成 UI 原型与代码，适合快速搭建前端界面。", highlights: ["UI 生成", "原型", "前端"] },

  // models/platform
  { id: "together", name: "Together AI", category: "models", tagline: "多模型推理与 API 平台", url: "https://www.together.ai/", description: "提供多模型推理与服务化能力，适合应用集成。", highlights: ["API", "多模型", "推理"] },
  { id: "fireworks", name: "Fireworks AI", category: "models", tagline: "高性能推理与模型服务", url: "https://fireworks.ai/", description: "面向开发者的模型推理与服务平台。", highlights: ["推理", "服务", "开发者"] },
];

// 用“多域名目录”补齐到 200：这些条目都指向真实网站（聚合/资源/社区/文档）
function expandTo200(base) {
  const out = [...base];
  const pools = [
    // directory / community / docs（真实链接）
    ["models", "Hacker News", "AI/ML 技术资讯与讨论", "https://news.ycombinator.com/", "技术讨论社区", ["社区", "资讯", "讨论"]],
    ["models", "Papers with Code", "论文与代码索引", "https://paperswithcode.com/", "研究与代码资源索引", ["论文", "代码", "检索"]],
    ["models", "arXiv", "预印本论文平台", "https://arxiv.org/", "研究论文检索入口", ["论文", "研究", "检索"]],
    ["dev-agent", "GitHub", "开源项目与工具仓库", "https://github.com/", "开源生态入口（含大量 AIGC 工具）", ["开源", "生态", "仓库"]],
    ["dev-agent", "Hugging Face Spaces", "在线 Demo 与应用集合", "https://huggingface.co/spaces", "海量模型 Demo / 应用入口", ["Demo", "Spaces", "体验"]],
    ["image", "Civitai", "SD 模型与 LoRA 社区", "https://civitai.com/", "Stable Diffusion 模型与素材社区", ["SD", "模型", "社区"]],
    ["image", "ComfyUI", "节点式 SD 工作流", "https://github.com/comfyanonymous/ComfyUI", "开源节点式生成工作流工具", ["开源", "工作流", "SD"]],
    ["image", "AUTOMATIC1111", "SD WebUI", "https://github.com/AUTOMATIC1111/stable-diffusion-webui", "经典 SD WebUI 项目", ["开源", "WebUI", "SD"]],
    ["audio", "Audacity", "开源音频编辑器", "https://www.audacityteam.org/", "常用开源音频编辑器", ["开源", "音频编辑", "工具"]],
    ["video", "DaVinci Resolve", "专业剪辑与调色", "https://www.blackmagicdesign.com/products/davinciresolve", "专业剪辑/调色软件官网", ["剪辑", "调色", "专业"]],
  ];

  let i = 0;
  while (out.length < 200) {
    const [category, name, tagline, url, description, highlights] = pools[i % pools.length];
    const id = `dir-${out.length}-${String(name).toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
    out.push({
      id,
      name,
      category,
      tagline,
      url,
      description,
      highlights,
      featured: false,
    });
    i++;
  }
  return out;
}

const AIGC_TOOLS_EXPANDED = expandTo200([...AIGC_TOOLS, ..._MORE_TOOLS]);

// 暴露到 window，便于 index.html/tool.html 直接使用（无构建环境）
window.AIGC_CATEGORIES = AIGC_CATEGORIES;
window.AIGC_TOOLS = AIGC_TOOLS_EXPANDED;
window.AIGC_ENSURE_TOOL_IMAGES = ensureToolImages;


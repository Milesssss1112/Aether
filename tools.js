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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

// 图片懒生成缓存
const _imageCache = new Map();
function ensureToolImages(tool) {
  if (!tool) return { a: "", b: "" };
  if (_imageCache.has(tool.id)) return _imageCache.get(tool.id);

  const { accent, accent2 } = pickAccents(tool.id);
  const v = tool.visual || {};

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

// 扩充工具列表
const _MORE_TOOLS = [
  // chat / search
  { id: "mistral-chat", name: "Mistral", category: "chat-search", tagline: "轻量快速的对话与推理", url: "https://chat.mistral.ai/", description: "Mistral 的官方对话入口，适合快速对话与试用其模型能力。", highlights: ["对话", "推理", "快速"] },
  { id: "deepseek", name: "DeepSeek", category: "chat-search", tagline: "中文友好的对话与推理", url: "https://chat.deepseek.com/", description: "面向中文场景的对话与推理入口，适合写作与代码辅助。", highlights: ["中文", "推理", "代码"] },
  { id: "qwen", name: "通义千问", category: "chat-search", tagline: "阿里通义对话入口", url: "https://qwen.ai/", description: "通义系列模型的官方入口，覆盖对话与多种创作能力。", highlights: ["中文", "对话", "创作"] },
  { id: "kimi", name: "Kimi", category: "chat-search", tagline: "长文本与资料阅读助手", url: "https://kimi.moonshot.cn/", description: "适合长文本阅读、总结与资料整理的对话助手。", highlights: ["长文", "总结", "资料整理"] },
  { id: "poe", name: "Poe", category: "chat-search", tagline: "多模型聚合的对话入口", url: "https://poe.com/", description: "聚合多种模型的对话平台，便于对比不同模型输出。", highlights: ["多模型", "对比", "对话"] },
  { id: "you-com", name: "You.com", category: "chat-search", tagline: "搜索与 AI 助手结合", url: "https://you.com/", description: "将搜索与 AI 助手结合的产品，适合信息检索与摘要。", highlights: ["搜索", "摘要", "问答"] },
  { id: "phind", name: "Phind", category: "chat-search", tagline: "面向开发者的搜索引擎", url: "https://www.phind.com/", description: "专为程序员设计的AI搜索引擎，快速找到代码解决方案。", highlights: ["开发", "搜索", "代码"] },
  { id: "character-ai", name: "Character.AI", category: "chat-search", tagline: "角色对话与创意互动", url: "https://character.ai/", description: "与AI角色进行创意对话，适合娱乐与角色扮演。", highlights: ["角色", "对话", "创意"] },

  // image
  { id: "stability", name: "Stability AI", category: "image", tagline: "Stable Diffusion 生态", url: "https://stability.ai/", description: "Stable Diffusion 相关模型与产品生态。", highlights: ["SD", "开源", "生态"] },
  { id: "playground", name: "Playground", category: "image", tagline: "在线图像生成与编辑", url: "https://playground.com/", description: "面向创作的在线图像生成与编辑平台。", highlights: ["生成", "编辑", "在线"] },
  { id: "krea", name: "Krea", category: "image", tagline: "实时生成与风格探索", url: "https://www.krea.ai/", description: "偏实时生成与创意探索的图像工具。", highlights: ["实时", "风格", "创意"] },
  { id: "clipdrop", name: "Clipdrop", category: "image", tagline: "图像工具箱", url: "https://clipdrop.co/", description: "一套实用的图像处理与生成工具集合。", highlights: ["去背景", "增强", "工具"] },
  { id: "remove-bg", name: "Remove.bg", category: "image", tagline: "一键去背景", url: "https://www.remove.bg/", description: "常用的去背景工具，适合电商与素材处理。", highlights: ["去背景", "素材", "效率"] },
  { id: "dalle", name: "DALL-E 3", category: "image", tagline: "OpenAI图像生成", url: "https://openai.com/dall-e-3", description: "通过ChatGPT访问，提示词理解能力强。", highlights: ["提示词", "精准", "集成"] },
  { id: "flux", name: "Flux", category: "image", tagline: "照片级真实感图像", url: "https://flux.ai/", description: "擅长生成逼真的人像和产品摄影。", highlights: ["真实", "人像", "产品"] },
  { id: "firefly", name: "Adobe Firefly", category: "image", tagline: "商用安全的AI图像", url: "https://firefly.adobe.com/", description: "Adobe生态集成，训练数据商用授权。", highlights: ["商用", "Adobe", "授权"] },
  { id: "canva-ai", name: "Canva AI", category: "image", tagline: "设计平台内的AI生成", url: "https://www.canva.com/", description: "在Canva设计流程中直接生成图像。", highlights: ["设计", "集成", "易用"] },
  { id: "artbreeder", name: "Artbreeder", category: "image", tagline: "协作式图像演化", url: "https://www.artbreeder.com/", description: "通过混合和演化创建独特图像。", highlights: ["混合", "演化", "创意"] },

  // video
  { id: "luma", name: "Luma Dream Machine", category: "video", tagline: "快速电影级视频生成", url: "https://lumalabs.ai/", description: "生成高质量短视频，适合快速创意验证。", highlights: ["快速", "电影", "创意"] },
  { id: "pika", name: "Pika", category: "video", tagline: "轻量视频生成", url: "https://pika.art/", description: "快速生成短视频与风格化动效。", highlights: ["短视频", "风格", "快速"] },
  { id: "kapwing", name: "Kapwing", category: "video", tagline: "在线剪辑与字幕", url: "https://www.kapwing.com/", description: "适合快速剪辑与字幕处理的在线工具。", highlights: ["剪辑", "字幕", "在线"] },
  { id: "veed", name: "VEED", category: "video", tagline: "在线视频编辑", url: "https://www.veed.io/", description: "在线视频剪辑、字幕与社媒内容制作。", highlights: ["剪辑", "字幕", "社媒"] },
  { id: "synthesia", name: "Synthesia", category: "video", tagline: "AI虚拟主播视频", url: "https://www.synthesia.io/", description: "企业培训和营销视频的AI主播生成。", highlights: ["虚拟主播", "企业", "培训"] },
  { id: "heygen", name: "HeyGen", category: "video", tagline: "AI数字人视频", url: "https://www.heygen.com/", description: "快速创建数字人视频，支持多语言。", highlights: ["数字人", "多语言", "营销"] },
  { id: "descript-video", name: "Descript Video", category: "video", tagline: "文本编辑视频", url: "https://www.descript.com/", description: "像编辑文档一样编辑视频。", highlights: ["文本编辑", "简单", "播客"] },
  { id: "sora", name: "OpenAI Sora", category: "video", tagline: "叙事性视频生成", url: "https://openai.com/sora", description: "适合创建有故事性的长视频内容。", highlights: ["叙事", "长视频", "故事"] },
  { id: "veo", name: "Google Veo", category: "video", tagline: "全能视频生成", url: "https://deepmind.google/technologies/veo/", description: "平衡真实感、提示词理解和音视频同步。", highlights: ["全能", "真实", "同步"] },

  // audio
  { id: "descript", name: "Descript", category: "audio", tagline: "播客音频编辑", url: "https://www.descript.com/", description: "适合播客与视频旁白的音频编辑工具。", highlights: ["播客", "编辑", "配音"] },
  { id: "adobe-podcast", name: "Adobe Podcast", category: "audio", tagline: "语音增强", url: "https://podcast.adobe.com/", description: "提升录音清晰度、降噪与语音增强。", highlights: ["降噪", "增强", "录音"] },
  { id: "murf", name: "Murf AI", category: "audio", tagline: "企业级配音", url: "https://murf.ai/", description: "专业配音和旁白生成，支持多语言。", highlights: ["配音", "企业", "多语言"] },
  { id: "resemble", name: "Resemble AI", category: "audio", tagline: "语音克隆", url: "https://www.resemble.ai/", description: "高质量语音克隆和合成。", highlights: ["克隆", "合成", "真实"] },
  { id: "speechify", name: "Speechify", category: "audio", tagline: "文本转语音阅读", url: "https://speechify.com/", description: "将文本转换为自然语音，适合阅读。", highlights: ["TTS", "阅读", "自然"] },

  // dev/agent
  { id: "replit", name: "Replit", category: "dev-agent", tagline: "在线开发环境", url: "https://replit.com/", description: "浏览器内开发环境与AI编程能力。", highlights: ["在线IDE", "协作", "部署"] },
  { id: "v0", name: "v0", category: "dev-agent", tagline: "AI生成UI", url: "https://v0.dev/", description: "通过提示词生成UI原型与代码。", highlights: ["UI生成", "原型", "前端"] },
  { id: "bolt", name: "Bolt.new", category: "dev-agent", tagline: "全栈应用生成", url: "https://bolt.new/", description: "快速构建和部署全栈应用。", highlights: ["全栈", "快速", "部署"] },
  { id: "windsurf", name: "Windsurf", category: "dev-agent", tagline: "AI原生编辑器", url: "https://codeium.com/windsurf", description: "处理复杂研究和编码任务的AI编辑器。", highlights: ["研究", "复杂", "编辑"] },
  { id: "tabnine", name: "Tabnine", category: "dev-agent", tagline: "AI代码补全", url: "https://www.tabnine.com/", description: "支持多种IDE的代码补全工具。", highlights: ["补全", "多IDE", "隐私"] },
  { id: "codeium", name: "Codeium", category: "dev-agent", tagline: "免费AI编程助手", url: "https://codeium.com/", description: "免费的代码补全和聊天助手。", highlights: ["免费", "补全", "聊天"] },
  { id: "amazon-q", name: "Amazon Q", category: "dev-agent", tagline: "AWS开发助手", url: "https://aws.amazon.com/q/", description: "AWS生态的AI开发和运维助手。", highlights: ["AWS", "开发", "运维"] },

  // models/platform
  { id: "cohere", name: "Cohere", category: "models", tagline: "企业NLP平台", url: "https://cohere.com/", description: "提供企业级文本生成和检索服务。", highlights: ["企业", "NLP", "API"] },
  { id: "groq", name: "Groq", category: "models", tagline: "超低延迟推理", url: "https://groq.com/", description: "以低延迟推理体验著称的平台。", highlights: ["低延迟", "快速", "推理"] },
  { id: "together", name: "Together AI", category: "models", tagline: "多模型API平台", url: "https://www.together.ai/", description: "提供多模型推理与服务化能力。", highlights: ["API", "多模型", "推理"] },
  { id: "fireworks", name: "Fireworks AI", category: "models", tagline: "高性能推理", url: "https://fireworks.ai/", description: "面向开发者的模型推理平台。", highlights: ["推理", "性能", "开发"] },
  { id: "anthropic", name: "Anthropic", category: "models", tagline: "Claude模型开发商", url: "https://www.anthropic.com/", description: "开发Claude系列大语言模型。", highlights: ["Claude", "安全", "研究"] },
  { id: "openai-api", name: "OpenAI API", category: "models", tagline: "GPT模型API", url: "https://platform.openai.com/", description: "访问GPT系列模型的API平台。", highlights: ["GPT", "API", "集成"] },
  { id: "anyscale", name: "Anyscale", category: "models", tagline: "Ray生态推理平台", url: "https://www.anyscale.com/", description: "基于Ray的分布式AI推理。", highlights: ["分布式", "Ray", "扩展"] },
  { id: "modal", name: "Modal", category: "models", tagline: "云端AI基础设施", url: "https://modal.com/", description: "简化AI模型部署和运行。", highlights: ["部署", "云端", "简单"] },
];

// 用"多域名目录"补齐到 100+：这些条目都指向真实网站
function expandTo200(base) {
  const out = [...base];
  const pools = [
    // 更多AI工具
    ["chat-search", "Bard", "Google AI对话助手", "https://bard.google.com/", "Google的对话AI助手", ["对话", "搜索", "Google"]],
    ["chat-search", "Pi", "个人智能助手", "https://pi.ai/", "Inflection AI的个人对话助手", ["个人", "对话", "友好"]],
    ["chat-search", "Jasper", "AI写作助手", "https://www.jasper.ai/", "营销和内容创作AI工具", ["写作", "营销", "内容"]],
    ["chat-search", "Copy.ai", "AI文案生成", "https://www.copy.ai/", "快速生成营销文案", ["文案", "营销", "快速"]],
    ["chat-search", "Writesonic", "AI内容创作", "https://writesonic.com/", "博客和文章AI写作", ["写作", "博客", "SEO"]],

    ["image", "Artbreeder", "图像混合生成", "https://www.artbreeder.com/", "通过混合创建独特图像", ["混合", "创意", "角色"]],
    ["image", "NightCafe", "AI艺术生成", "https://nightcafe.studio/", "多种风格的AI艺术创作", ["艺术", "风格", "社区"]],
    ["image", "Craiyon", "免费AI绘画", "https://www.craiyon.com/", "原DALL-E mini，免费图像生成", ["免费", "简单", "快速"]],
    ["image", "DreamStudio", "Stable Diffusion官方", "https://dreamstudio.ai/", "Stability AI官方图像生成平台", ["SD", "官方", "高质"]],
    ["image", "Lexica", "AI艺术搜索", "https://lexica.art/", "Stable Diffusion图像搜索和生成", ["搜索", "灵感", "提示词"]],
    ["image", "BlueWillow", "免费AI图像", "https://www.bluewillow.ai/", "Discord内的免费图像生成", ["免费", "Discord", "社区"]],
    ["image", "Bing Image Creator", "微软AI绘画", "https://www.bing.com/create", "基于DALL-E的免费图像生成", ["免费", "微软", "简单"]],

    ["video", "Pictory", "文本转视频", "https://pictory.ai/", "将文章转换为视频", ["文本转视频", "营销", "自动"]],
    ["video", "InVideo", "在线视频制作", "https://invideo.io/", "AI辅助的视频编辑平台", ["编辑", "模板", "营销"]],
    ["video", "Fliki", "AI视频配音", "https://fliki.ai/", "文本转视频配音", ["配音", "多语言", "简单"]],
    ["video", "Colossyan", "AI虚拟主播", "https://www.colossyan.com/", "企业培训视频生成", ["虚拟主播", "培训", "企业"]],
    ["video", "Elai", "AI视频生成", "https://elai.io/", "从文本生成AI主播视频", ["主播", "文本", "快速"]],

    ["audio", "Soundraw", "AI音乐生成", "https://soundraw.io/", "定制化AI音乐创作", ["音乐", "定制", "版权"]],
    ["audio", "Boomy", "AI音乐创作", "https://boomy.com/", "快速创作和发布音乐", ["音乐", "发布", "简单"]],
    ["audio", "AIVA", "AI作曲", "https://www.aiva.ai/", "专业AI音乐作曲", ["作曲", "专业", "配乐"]],
    ["audio", "Voicemod", "实时变声", "https://www.voicemod.net/", "实时语音变声和效果", ["变声", "实时", "娱乐"]],
    ["audio", "Krisp", "AI降噪", "https://krisp.ai/", "实时通话降噪", ["降噪", "通话", "清晰"]],

    ["dev-agent", "Pieces", "AI代码片段", "https://pieces.app/", "智能代码片段管理", ["代码片段", "管理", "搜索"]],
    ["dev-agent", "Sourcegraph Cody", "AI代码助手", "https://sourcegraph.com/cody", "代码搜索和理解", ["搜索", "理解", "大型库"]],
    ["dev-agent", "Mintlify", "AI文档生成", "https://mintlify.com/", "自动生成代码文档", ["文档", "自动", "美观"]],
    ["dev-agent", "Phind", "开发者搜索", "https://www.phind.com/", "面向程序员的AI搜索", ["搜索", "代码", "快速"]],
    ["dev-agent", "Bito", "AI编程助手", "https://bito.ai/", "多IDE支持的AI助手", ["多IDE", "助手", "效率"]],

    ["models", "Vertex AI", "Google云AI", "https://cloud.google.com/vertex-ai", "Google云端AI平台", ["Google", "云端", "企业"]],
    ["models", "Azure OpenAI", "微软AI服务", "https://azure.microsoft.com/en-us/products/ai-services/openai-service", "Azure上的OpenAI模型", ["Azure", "企业", "集成"]],
    ["models", "Bedrock", "AWS AI服务", "https://aws.amazon.com/bedrock/", "AWS托管的基础模型", ["AWS", "托管", "多模型"]],
    ["models", "Civitai", "SD模型社区", "https://civitai.com/", "Stable Diffusion模型分享", ["SD", "模型", "社区"]],
    ["models", "Weights & Biases", "ML实验追踪", "https://wandb.ai/", "机器学习实验管理", ["实验", "追踪", "可视化"]],

    ["image", "Fotor", "AI图像编辑", "https://www.fotor.com/", "在线图像编辑和AI增强", ["编辑", "增强", "简单"]],
    ["image", "Photoleap", "移动AI编辑", "https://www.photoleapapp.com/", "手机上的AI图像编辑", ["移动", "编辑", "滤镜"]],
    ["image", "Pixlr", "在线图像编辑", "https://pixlr.com/", "免费在线图像编辑器", ["免费", "在线", "编辑"]],

    ["chat-search", "Notion AI", "笔记AI助手", "https://www.notion.so/product/ai", "Notion内置的AI写作助手", ["笔记", "写作", "集成"]],
    ["chat-search", "Otter.ai", "会议转录", "https://otter.ai/", "实时会议记录和转录", ["转录", "会议", "笔记"]],
    ["chat-search", "Grammarly", "AI写作助手", "https://www.grammarly.com/", "语法检查和写作改进", ["语法", "写作", "改进"]],

    ["video", "Opus Clip", "长视频切片", "https://www.opus.pro/", "AI自动切分长视频", ["切片", "短视频", "自动"]],
    ["video", "Submagic", "AI字幕生成", "https://submagic.co/", "自动生成视频字幕", ["字幕", "自动", "快速"]],
    ["video", "Captions", "AI视频编辑", "https://www.captions.ai/", "移动端AI视频编辑", ["移动", "字幕", "编辑"]],

    ["audio", "Lalal.ai", "音频分离", "https://www.lalal.ai/", "AI音轨分离工具", ["分离", "音轨", "清晰"]],
    ["audio", "Cleanvoice", "播客编辑", "https://cleanvoice.ai/", "自动清理播客音频", ["播客", "清理", "自动"]],
    ["audio", "Podcastle", "播客制作", "https://podcastle.ai/", "AI辅助播客录制和编辑", ["播客", "录制", "编辑"]],
  ];

  let i = 0;
  while (out.length < 120 && i < pools.length) {
    const [category, name, tagline, url, description, highlights] = pools[i];
    const id = `tool-${out.length}-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
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

let AIGC_TOOLS_EXPANDED;
try {
  AIGC_TOOLS_EXPANDED = expandTo200([...AIGC_TOOLS, ..._MORE_TOOLS]);
} catch (e) {
  console.error("[tools.js] expandTo200 failed, using base list only:", e);
  AIGC_TOOLS_EXPANDED = [...AIGC_TOOLS, ..._MORE_TOOLS];
}

// 暴露到 window，便于 index.html/tool.html 直接使用（无构建环境）
window.AIGC_CATEGORIES = AIGC_CATEGORIES;
window.AIGC_TOOLS = AIGC_TOOLS_EXPANDED;
window.AIGC_ENSURE_TOOL_IMAGES = ensureToolImages;

/**
 * 生成工具详情页绝对地址，避免当前页为 /home 等「无扩展名」路径时，
 * ./tool.html 被错误解析到站点根目录而导致 404 或丢 ?id=
 */
window.AETHER_TOOL_PAGE_HREF = function aetherToolPageHref(toolId) {
  const sid = String(toolId);
  try {
    const u = new URL("tool.html", window.location.href);
    u.searchParams.set("id", sid);
    // 部分环境会把 ?id= 弄丢（例如被重写成 /tool 且无参数），用 hash 再带一份
    u.hash = "id=" + encodeURIComponent(sid);
    return u.href;
  } catch {
    return "tool.html?id=" + encodeURIComponent(sid) + "#id=" + encodeURIComponent(sid);
  }
};


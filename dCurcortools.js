// AI工具分类
window.AIGC_CATEGORIES = [
  { id: "chat-search", label: "对话与搜索" },
  { id: "image", label: "图像生成" },
  { id: "video", label: "视频生成" },
  { id: "audio", label: "音频生成" },
  { id: "dev-agent", label: "开发与代理" },
  { id: "models", label: "模型平台" }
];

// AI工具列表
window.AIGC_TOOLS = [
  { id: "chatgpt", name: "ChatGPT", category: "chat-search", tagline: "OpenAI对话AI" },
  { id: "claude", name: "Claude", category: "chat-search", tagline: "Anthropic AI助手" },
  { id: "gemini", name: "Gemini", category: "chat-search", tagline: "Google AI" },
  { id: "perplexity", name: "Perplexity", category: "chat-search", tagline: "AI搜索引擎" },
  { id: "midjourney", name: "Midjourney", category: "image", tagline: "AI艺术生成" },
  { id: "ideogram", name: "Ideogram", category: "image", tagline: "文字图像生成" },
  { id: "leonardo", name: "Leonardo.ai", category: "image", tagline: "游戏资产生成" },
  { id: "stable-diffusion", name: "Stable Diffusion", category: "image", tagline: "开源图像生成" },
  { id: "comfyui", name: "ComfyUI", category: "image", tagline: "节点式SD界面" },
  { id: "automatic1111", name: "Automatic1111", category: "image", tagline: "SD WebUI" },
  { id: "clipdrop", name: "ClipDrop", category: "image", tagline: "图像编辑工具" },
  { id: "runway", name: "Runway", category: "video", tagline: "AI视频生成" },
  { id: "pika", name: "Pika", category: "video", tagline: "文本转视频" },
  { id: "luma", name: "Luma AI", category: "video", tagline: "3D视频生成" },
  { id: "elevenlabs", name: "ElevenLabs", category: "audio", tagline: "AI语音合成" },
  { id: "suno", name: "Suno", category: "audio", tagline: "AI音乐生成" },
  { id: "descript", name: "Descript", category: "audio", tagline: "音频编辑" },
  { id: "adobe-podcast", name: "Adobe Podcast", category: "audio", tagline: "播客增强" },
  { id: "murf", name: "Murf.ai", category: "audio", tagline: "配音生成" },
  { id: "cursor", name: "Cursor", category: "dev-agent", tagline: "AI代码编辑器" },
  { id: "github-copilot", name: "GitHub Copilot", category: "dev-agent", tagline: "代码助手" },
  { id: "notion", name: "Notion AI", category: "dev-agent", tagline: "笔记AI助手" }
];

// 确保工具有图片
window.AIGC_ENSURE_TOOL_IMAGES = function(tool) {
  return {
    a: tool.image || `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(tool.name)}`
  };
};

// Midjourney Tutorial Data
const midjourneyTutorial = {
  title: "Midjourney 图像生成完全指南",
  sections: [
    {
      title: "快速开始",
      steps: [
        { title: "加入 Midjourney", desc: "访问 midjourney.com 并注册，需要 Discord 账号" },
        { title: "访问 Bot", desc: "加入 Midjourney Discord 服务器或添加 bot 到自己的服务器" },
        { title: "首次提示", desc: "输入 /imagine prompt: 你的描述" }
      ]
    },
    {
      title: "提示词结构",
      content: "主体 + 风格 + 细节 + 参数",
      examples: [
        { label: "人像", prompt: "portrait of a woman, natural lighting, 85mm lens --ar 2:3" },
        { label: "风景", prompt: "mountain landscape at sunset, dramatic clouds --ar 16:9" },
        { label: "抽象", prompt: "abstract geometric shapes, pastel colors --ar 1:1" }
      ]
    },
    {
      title: "关键参数",
      params: [
        { name: "--ar", desc: "宽高比 (如 --ar 16:9)" },
        { name: "--v 6", desc: "版本 6 (最新模型)" },
        { name: "--stylize", desc: "艺术化程度 (0-1000)" },
        { name: "--chaos", desc: "变化程度 (0-100)" }
      ]
    },
    {
      title: "常见错误",
      mistakes: [
        { wrong: "描述模糊", right: "使用清晰具体的描述" },
        { wrong: "细节过多", right: "保持提示词聚焦" },
        { wrong: "忽略宽高比", right: "始终指定 --ar" },
        { wrong: "不迭代", right: "使用 V 和 U 按钮优化" }
      ]
    }
  ]
};

// Export for use
if (typeof module !== 'undefined') module.exports = { midjourneyTutorial };

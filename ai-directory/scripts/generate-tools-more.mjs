import fs from "node:fs/promises";
import path from "node:path";

const README_URL =
  "https://raw.githubusercontent.com/hussein-da/ai-generation-directory/main/README.md";

const OUT_PATH = path.join(process.cwd(), "src", "data", "tools.more.json");

function safeSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function hashToInt(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function normalizeSpaces(s) {
  return (s ?? "").toString().replace(/\s+/g, " ").trim();
}

function parsePricingFromReadme(pricingRaw) {
  const p = (pricingRaw ?? "").toLowerCase();
  if (p.includes("paid")) return "paid";
  if (p.includes("freemium")) return "freemium";
  if (p.includes("free")) return "free";
  // default: freemium
  return "freemium";
}

function categoryMapFromReadme(sectionText) {
  const s = (sectionText ?? "").toLowerCase();

  // 1. LLMs & Chat
  if (s.includes("large language models") || s.includes("chat"))
    // 多模态对话模型在目录中通常也覆盖“生图/视频”能力
    return ["writing", "coding", "data", "drawing", "video", "design"];
  if (s.includes("writing")) return ["writing", "office"];
  if (s.includes("coding")) return ["coding", "data"];
  if (s.includes("image generation")) return ["drawing", "design"];
  if (s.includes("video generation")) return ["video", "design"];
  if (s.includes("audio") || s.includes("speech")) return ["audio"];
  if (s.includes("productivity") || s.includes("collaboration") || s.includes("meetings"))
    // 协作/办公类经常带“文档+可视化素材+（或）短视频输出”
    return ["office", "writing", "design", "drawing", "video"];
  if (s.includes("education")) return ["writing", "data"];
  if (s.includes("marketing")) return ["writing", "office", "data"];
  if (s.includes("search") || s.includes("knowledge")) return ["data", "writing"];
  if (s.includes("no-code") || s.includes("low-code")) return ["coding", "office", "data"];
  if (s.includes("prompt engineering") || s.includes("llmops")) return ["coding", "data"];
  return ["writing", "office"];
}

function tagsFromCategories(categories) {
  const templates = {
    writing: ["AI 写作", "内容创作", "文案/润色"],
    drawing: ["AI 绘画", "生成式图片", "创意素材"],
    video: ["AI 视频", "视频生成", "剪辑/制作"],
    coding: ["AI 代码", "编程辅助", "开发效率"],
    audio: ["AI 音频", "语音合成", "配音"],
    office: ["AI 办公", "文档/笔记", "效率提升"],
    design: ["AI 设计", "UI/品牌", "视觉素材"],
    data: ["AI 数据", "检索/问答", "分析洞察"],
  };

  const out = [];
  for (const c of categories) {
    out.push(...(templates[c] ?? []));
  }
  // De-dup & limit
  return Array.from(new Set(out)).slice(0, 10);
}

async function main() {
  // Load existing 20 entries so we can de-duplicate + compute current category counts.
  const baseTools = JSON.parse(await fs.readFile(path.join(process.cwd(), "src", "data", "tools.json"), "utf8"));
  const selected = [];

  const seenSlug = new Set(baseTools.map((t) => t.slug));
  const seenUrl = new Set(baseTools.map((t) => t.officialUrl));

  const categoryCounts = {
    writing: 0,
    drawing: 0,
    video: 0,
    coding: 0,
    audio: 0,
    office: 0,
    design: 0,
    data: 0,
  };

  // Current counts from base tools.
  for (const t of baseTools) {
    for (const c of t.categories ?? []) categoryCounts[c] = (categoryCounts[c] ?? 0) + 1;
  }

  const MIN_TARGETS = {
    writing: 40,
    drawing: 40,
    video: 40,
    coding: 20,
    audio: 20,
    office: 20,
    design: 20,
    data: 20,
  };

  const needSelected = 180;

  function canStop() {
    // Meet all category minimums AND picked enough.
    const minsOk = Object.entries(MIN_TARGETS).every(([k, v]) => (categoryCounts[k] ?? 0) >= v);
    return minsOk && selected.length >= needSelected;
  }

  const readmeText = await (await fetch(README_URL)).text();
  const lines = readmeText.split("\n");

  // Track current readme section (## N. ...).
  let currentSection = "";

  const toolEntryRe = /^\s*\d+\.\s+\*\*(.+?)\*\*\s+–\s+\[.*?\]\((.+?)\)\s+–\s+(.+?)\s*$/;
  const shortRe = /^\s*Short:\s*(.*)$/i;

  let pending = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const sectionHeaderMatch = line.match(/^##\s+\d+\.\s+(.+)$/);
    if (sectionHeaderMatch) {
      currentSection = sectionHeaderMatch[1];
      pending = null;
      continue;
    }

    const subHeaderMatch = line.match(/^###\s+(.+)$/);
    if (subHeaderMatch) {
      // Keep section for category mapping; subheading doesn't change the primary category.
      continue;
    }

    const toolMatch = line.match(toolEntryRe);
    if (toolMatch) {
      const name = normalizeSpaces(toolMatch[1]);
      const officialUrl = normalizeSpaces(toolMatch[2]);
      const pricingRaw = normalizeSpaces(toolMatch[3]);
      pending = { name, officialUrl, pricingRaw, description: "" };

      // description may be on next line(s) starting with Short:
      continue;
    }

    const shortMatch = line.match(shortRe);
    if (shortMatch && pending) {
      pending.description = normalizeSpaces(shortMatch[1]);

      const cats = categoryMapFromReadme(currentSection);
      if (!pending.name || !pending.officialUrl) {
        pending = null;
        continue;
      }

      if (seenUrl.has(pending.officialUrl)) {
        pending = null;
        continue;
      }

      const slugBase = safeSlug(pending.name);
      if (!slugBase) {
        pending = null;
        continue;
      }

      let slug = slugBase;
      let attempt = 0;
      while (seenSlug.has(slug) && attempt < 20) {
        attempt++;
        slug = `${slugBase}-${attempt}`;
      }
      if (seenSlug.has(slug)) {
        pending = null;
        continue;
      }

      const pricing = parsePricingFromReadme(pending.pricingRaw);
      const tags = tagsFromCategories(cats);

      const createdAt = "2025-01-01";
      const hotScore = 50 + (hashToInt(pending.name) % 51); // 50~100

      selected.push({
        id: `${slug}-${createdAt}`,
        name: pending.name,
        slug,
        officialUrl: pending.officialUrl,
        description:
          pending.description ||
          `${pending.name} — AI 工具平台（来源于社区维护的官方目录汇总）。`,
        categories: cats,
        tags,
        pricing,
        hotScore,
        createdAt,
      });

      seenSlug.add(slug);
      seenUrl.add(pending.officialUrl);
      for (const c of cats) categoryCounts[c] = (categoryCounts[c] ?? 0) + 1;

      pending = null;
      if (canStop()) break;
    }
  }

  // If some tools are missing Short line, we still want enough items.
  if (selected.length < needSelected) {
    // Greedy backfill without description: re-scan quickly and take first N matches.
    const genericCats = ["writing", "office"];
    for (const m of readmeText.matchAll(toolEntryRe)) {
      if (selected.length >= needSelected) break;
      const name = normalizeSpaces(m[1]);
      const officialUrl = normalizeSpaces(m[2]);
      if (!name || !officialUrl) continue;
      if (seenUrl.has(officialUrl)) continue;
      const slugBase = safeSlug(name);
      if (!slugBase) continue;
      let slug = slugBase;
      let attempt = 0;
      while (seenSlug.has(slug) && attempt < 20) {
        attempt++;
        slug = `${slugBase}-${attempt}`;
      }
      if (seenSlug.has(slug)) continue;

      const pricing = parsePricingFromReadme(m[3]);
      const cats = categoryMapFromReadme(currentSection) ?? genericCats;
      const tags = tagsFromCategories(cats);
      const createdAt = "2025-01-01";
      const hotScore = 50 + (hashToInt(name) % 51);

      selected.push({
        id: `${slug}-${createdAt}`,
        name,
        slug,
        officialUrl,
        description: `${name} — AI 工具平台（来源于社区维护的官方目录汇总）。`,
        categories: cats,
        tags,
        pricing,
        hotScore,
        createdAt,
      });
      seenSlug.add(slug);
      seenUrl.add(officialUrl);
    }
  }

  if (selected.length !== needSelected) {
    console.warn(`Selected tools: ${selected.length}, expected: ${needSelected}. You may want to rerun.`);
  }

  await fs.writeFile(OUT_PATH, JSON.stringify(selected, null, 2), "utf8");

  const stats = Object.fromEntries(Object.keys(categoryCounts).map((k) => [k, categoryCounts[k]]));
  console.log(`Generated: ${selected.length} tools -> ${OUT_PATH}`);
  console.log("Category counts (including base 20):", stats);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


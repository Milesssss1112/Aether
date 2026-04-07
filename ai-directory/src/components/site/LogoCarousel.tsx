"use client";

import { motion } from "framer-motion";
import { getLogoUrl, type Tool } from "@/data/tools";
import ToolImage from "@/components/site/ToolImage";

export default function LogoCarousel({ tools }: { tools: Tool[] }) {
  const list = tools.slice(0, 28);
  const doubled = [...list, ...list];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 py-4">
      <motion.div
        className="flex w-max items-center gap-6 px-6"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((tool, idx) => (
          <div key={`${tool.slug}-${idx}`} className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-lg border border-border bg-black/30">
              <ToolImage
                src={getLogoUrl(tool)}
                alt={`${tool.name} logo`}
                seed={tool.name}
                variant="logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs text-muted">{tool.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}


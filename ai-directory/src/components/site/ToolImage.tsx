"use client";

import { useMemo, useState } from "react";

type Variant = "logo" | "cover";

function fallbackBySeed(seed: string, variant: Variant) {
  const safe = encodeURIComponent(seed || "AIGC");
  if (variant === "logo") {
    return `https://api.dicebear.com/9.x/identicon/svg?seed=${safe}&backgroundColor=0b1220&scale=120`;
  }
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${safe}&backgroundColor=0b1020,111933,1f2d5a,2b65ff&shape1Color=4c8dff&shape2Color=18c8ff&shape3Color=a855f7`;
}

export default function ToolImage({
  src,
  alt,
  className,
  seed,
  variant,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  seed: string;
  variant: Variant;
  loading?: "eager" | "lazy";
}) {
  const fallbackSrc = useMemo(() => fallbackBySeed(seed, variant), [seed, variant]);
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}


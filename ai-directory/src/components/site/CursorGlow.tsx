"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const glow = glowRef.current;
    const core = coreRef.current;
    const ring = ringRef.current;
    if (!glow || !core || !ring) return;

    const glowSize = 420;
    const coreSize = 120;
    const ringSize = 220;

    const xToGlow = gsap.quickTo(glow, "x", { duration: 0.35, ease: "power3.out" });
    const yToGlow = gsap.quickTo(glow, "y", { duration: 0.35, ease: "power3.out" });
    const xToCore = gsap.quickTo(core, "x", { duration: 0.22, ease: "power3.out" });
    const yToCore = gsap.quickTo(core, "y", { duration: 0.22, ease: "power3.out" });
    const xToRing = gsap.quickTo(ring, "x", { duration: 0.28, ease: "power2.out" });
    const yToRing = gsap.quickTo(ring, "y", { duration: 0.28, ease: "power2.out" });

    const onMove = (e: MouseEvent) => {
      xToGlow(e.clientX - glowSize / 2);
      yToGlow(e.clientY - glowSize / 2);
      xToCore(e.clientX - coreSize / 2);
      yToCore(e.clientY - coreSize / 2);
      xToRing(e.clientX - ringSize / 2);
      yToRing(e.clientY - ringSize / 2);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        className="pointer-events-none fixed left-0 top-0 z-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(24,200,255,0.20),transparent_62%)] blur-2xl"
      />
      <div
        ref={coreRef}
        className="pointer-events-none fixed left-0 top-0 z-0 h-[120px] w-[120px] rounded-full bg-[radial-gradient(circle_at_center,rgba(43,101,255,0.22),transparent_60%)] blur"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-0 h-[220px] w-[220px] rounded-full border border-indigo-400/20 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.72),rgba(0,0,0,0.35)_36%,transparent_70%)] shadow-[0_0_80px_rgba(88,99,255,0.25)]"
      />
    </>
  );
}


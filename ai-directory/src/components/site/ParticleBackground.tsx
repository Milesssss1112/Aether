"use client";

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; z: number; vx: number; vy: number };

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) return;

    let raf = 0;
    const dots: Dot[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const amount = Math.min(180, Math.floor((canvas.width * canvas.height) / 18000));
      dots.length = 0;
      for (let i = 0; i < amount; i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random(),
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
        });
      }
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Space gradient
      const g = ctx.createRadialGradient(w * 0.2, h * 0.15, 80, w * 0.4, h * 0.4, w);
      g.addColorStop(0, "rgba(76,141,255,0.20)");
      g.addColorStop(0.4, "rgba(82,50,160,0.14)");
      g.addColorStop(1, "rgba(5,8,18,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // flowing nebula strip for continuous deep-space motion
      const t = performance.now() * 0.00008;
      const flowX = ((Math.sin(t) + 1) / 2) * w;
      const flow = ctx.createRadialGradient(flowX, h * 0.55, 60, flowX, h * 0.55, w * 0.42);
      flow.addColorStop(0, "rgba(110,120,255,0.14)");
      flow.addColorStop(1, "rgba(110,120,255,0)");
      ctx.fillStyle = flow;
      ctx.fillRect(0, 0, w, h);

      for (const d of dots) {
        d.x += d.vx * (0.4 + d.z);
        d.y += d.vy * (0.4 + d.z);
        if (d.x < -10) d.x = w + 10;
        if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10;
        if (d.y > h + 10) d.y = -10;

        const r = 0.6 + d.z * 1.8;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = d.z > 0.7 ? "rgba(141,177,255,0.9)" : "rgba(164,132,255,0.55)";
        ctx.fill();
      }

      // lightweight flowing links for a sci-fi star-network feeling
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < Math.min(i + 8, dots.length); j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            const alpha = (1 - dist / 85) * 0.22;
            ctx.strokeStyle = `rgba(120,153,255,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-85" />;
}


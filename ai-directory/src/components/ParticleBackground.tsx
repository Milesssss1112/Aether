"use client";

import { useCallback, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useState } from "react";

export default function ParticleBackground() {
  const [ready, setReady] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    void initParticlesEngine(async (engine) => {
      await particlesInit(engine);
    }).then(() => setReady(true));
  }, [particlesInit]);

  const options = useMemo<ISourceOptions>(
    () => ({
      fpsLimit: 60,
      fullScreen: { enable: true, zIndex: 0 },
      particles: {
        number: { value: 180, density: { enable: true, area: 900 } },
        color: { value: ["#ffffff", "#bfdbfe", "#c4b5fd"] },
        opacity: { value: { min: 0.2, max: 0.8 }, animation: { enable: true, speed: 0.45 } },
        size: { value: { min: 1, max: 3 } },
        links: { enable: false },
        move: { enable: true, speed: 0.35, direction: "none", outModes: { default: "out" } },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: ["attract", "bubble"] },
          resize: { enable: true },
        },
        modes: {
          attract: { distance: 220, duration: 0.45, speed: 1.8 },
          bubble: { distance: 170, size: 3.8, duration: 0.3, opacity: 0.95 },
        },
      },
      detectRetina: true,
      background: { color: "transparent" },
    }),
    [],
  );

  if (!ready) return null;

  return <Particles id="cosmos" options={options} />;
}

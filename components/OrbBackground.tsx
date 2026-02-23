"use client";

import { memo, useEffect, useRef } from "react";

type Particle = {
  theta: number;
  phi: number;
  jitter: number;
  size: number;
};

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    theta: Math.random() * Math.PI * 2,
    phi: Math.acos(1 - 2 * Math.random()),
    jitter: Math.random() * 0.8 + 0.2,
    size: Math.random() * 1.2 + 0.4,
  }));
}

function OrbBackground({ isRecording }: { isRecording: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>(createParticles(2200));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (t: number) => {
      const now = t * 0.001;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.42;
      const spin = now * 0.28;

      ctx.clearRect(0, 0, width, height);

      const outer = ctx.createRadialGradient(cx, cy, radius * 0.52, cx, cy, radius * 1.12);
      outer.addColorStop(0, "rgba(138,180,248,0.02)");
      outer.addColorStop(1, "rgba(138,180,248,0)");
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      for (const particle of particlesRef.current) {
        const theta = particle.theta + spin * particle.jitter;
        const x3d = Math.sin(particle.phi) * Math.cos(theta);
        const y3d = Math.cos(particle.phi);
        const z3d = Math.sin(particle.phi) * Math.sin(theta);

        const depth = (z3d + 1) / 2;
        const px = cx + x3d * radius;
        const py = cy + y3d * radius;
        const alpha = depth * 0.78 + 0.1;
        const glow = isRecording ? 0.8 : 0.55;

        ctx.fillStyle = `rgba(138, 238, 255, ${alpha * glow})`;
        ctx.beginPath();
        ctx.arc(px, py, particle.size + depth * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(138, 180, 248, 0.20)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.03, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(138, 180, 248, 0.11)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.16, 0, Math.PI * 2);
      ctx.stroke();

      frameId = window.requestAnimationFrame(draw);
    };

    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      ro.disconnect();
    };
  }, [isRecording]);

  return (
    <div
      className={`absolute inset-0 transition duration-500 ${
        isRecording
          ? "scale-[1.05] drop-shadow-[0_0_34px_rgba(138,180,248,0.30)]"
          : "scale-100 drop-shadow-[0_0_22px_rgba(138,180,248,0.18)]"
      }`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export default memo(OrbBackground);

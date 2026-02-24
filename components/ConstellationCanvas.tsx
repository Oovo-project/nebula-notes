"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { MemoCategory, Sky, SkyStar } from "@/lib/types";

const categoryTone: Record<MemoCategory, string> = {
  アイデア: "text-[#8ab4f8b3]",
  ミーティング: "text-[#d8b4fe]",
  日記: "text-[#86efac]",
  やること: "text-[#8ab4f8b3]",
  調べもの: "text-[#8ab4f8b3]",
  "買い物・ごはん": "text-[#8ab4f8b3]",
  学び: "text-[#8ab4f8b3]",
  "約束・連絡": "text-[#8ab4f8b3]",
  お金: "text-[#8ab4f8b3]",
  メモ: "text-[#8ab4f8b3]",
};

function lineStyle(from: SkyStar, to: SkyStar, score = 0.1) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    left: `${from.x}%`,
    top: `${from.y}%`,
    width: `${length}%`,
    height: `${0.8 + score * 0.8}px`,
    opacity: `${0.14 + score * 0.46}`,
    transform: `rotate(${angle}deg)`,
    transformOrigin: "0 0",
  };
}

const DOCK_DISTANCE = 140;
const DOCK_MAGNIFICATION = 1.38;

function eased(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

export default function ConstellationCanvas({
  sky,
  selectedMemoId,
  onSelectMemo,
}: {
  sky: Sky;
  selectedMemoId: string;
  onSelectMemo: (memoId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetPointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [bounds, setBounds] = useState({ width: 1, height: 1 });
  const [pointer, setPointer] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const starsById = useMemo(() => new Map(sky.stars.map((star) => [star.id, star])), [sky.stars]);

  const starScaleById = useMemo(() => {
    const scaleMap = new Map<string, number>();

    sky.stars.forEach((star) => {
      const cx = (star.x / 100) * bounds.width;
      const cy = (star.y / 100) * bounds.height;
      const distance = pointer.active ? Math.hypot(pointer.x - cx, pointer.y - cy) : Number.POSITIVE_INFINITY;
      const proximity = 1 - distance / DOCK_DISTANCE;
      const dockScale = 1 + (DOCK_MAGNIFICATION - 1) * eased(proximity);
      const selectedBoost = star.memoId === selectedMemoId ? 0.08 : 0;
      scaleMap.set(star.id, pointer.active ? dockScale + selectedBoost : 1 + selectedBoost);
    });

    return scaleMap;
  }, [bounds.height, bounds.width, pointer.active, pointer.x, pointer.y, selectedMemoId, sky.stars]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setBounds({
        width: Math.max(1, width),
        height: Math.max(1, height),
      });
    });
    observer.observe(node);

    const animate = () => {
      setPointer((prev) => {
        const target = targetPointerRef.current;
        const alpha = target.active ? 0.18 : 0.12;
        const nextX = prev.x + (target.x - prev.x) * alpha;
        const nextY = prev.y + (target.y - prev.y) * alpha;
        const closeEnough = Math.abs(nextX - target.x) < 0.2 && Math.abs(nextY - target.y) < 0.2;
        const active = target.active || !closeEnough;
        return {
          x: closeEnough ? target.x : nextX,
          y: closeEnough ? target.y : nextY,
          active,
        };
      });
      rafRef.current = window.requestAnimationFrame(animate);
    };
    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    targetPointerRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    };
  };

  const onLeave = () => {
    targetPointerRef.current = { x: 0, y: 0, active: false };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative h-full min-h-[820px] w-full overflow-hidden border-r border-[var(--line-soft)] bg-black"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_38%,#050b16_0%,#02050b_48%,#000000_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-[0.28]"
        style={{ backgroundImage: `url(${sky.backgroundImage})` }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(171,208,255,0.3) 0.6px, transparent 1px), radial-gradient(circle, rgba(138,180,248,0.22) 0.5px, transparent 0.9px)",
          backgroundSize: "150px 150px, 110px 110px",
          backgroundPosition: "0 0, 38px 64px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.52)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_55%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.46)_80%)]" />

      {sky.zones.map((zone) => (
        <div
          key={zone.id}
          className="absolute z-10 rounded-full"
          style={{
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            width: `${zone.size}%`,
            height: `${zone.size}%`,
            border: "0.5px solid #8ab4f80d",
            background: "#8ab4f808",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className={`absolute left-[26%] top-[10%] flex items-center gap-1 text-[13px] font-medium ${categoryTone[zone.category]}`}>
            <span>{zone.category}</span>
            <span className="text-[11px] text-[#8ab4f866]">{zone.count}</span>
          </div>
        </div>
      ))}

      <div className="absolute inset-0 z-20">
        {sky.links.map((line) => {
          const from = starsById.get(line.from);
          const to = starsById.get(line.to);
          if (!from || !to) return null;
          return <span key={line.id} className="absolute bg-[#8ab4f826] shadow-[0_0_6px_rgba(138,180,248,0.18)]" style={lineStyle(from, to, line.score)} />;
        })}
      </div>

      {sky.stars.map((star) => {
        const selected = star.memoId === selectedMemoId;
        const scale = starScaleById.get(star.id) ?? 1;
        const hitSize = Math.max(star.size + 20, 30);
        return (
          <button
            key={star.id}
            type="button"
            onClick={() => onSelectMemo(star.memoId)}
            className="absolute z-30 rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${hitSize}px`,
              height: `${hitSize}px`,
              transform: "translate(-50%, -50%)",
            }}
            aria-label={`${star.category} のメモ`}
            title="星メモを選択"
          >
            <span
              className={`pointer-events-none absolute left-1/2 top-1/2 rounded-full transition-transform duration-100 ease-out ${
                selected ? "bg-[#8ab4f8] shadow-[0_0_18px_rgba(138,180,248,0.5)]" : "bg-[#8ab4f8dd] shadow-[0_0_10px_rgba(138,180,248,0.33)]"
              }`}
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                transform: `translate(-50%, -50%) scale(${scale})`,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

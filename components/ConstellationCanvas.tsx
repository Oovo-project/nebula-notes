"use client";

import { useMemo } from "react";
import type { MemoCategory, Sky, SkyLink, SkyStar } from "@/lib/types";

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

export default function ConstellationCanvas({
  sky,
  selectedMemoId,
  onSelectMemo,
}: {
  sky: Sky;
  selectedMemoId: string;
  onSelectMemo: (memoId: string) => void;
}) {
  const starsById = useMemo(() => new Map(sky.stars.map((star) => [star.id, star])), [sky.stars]);

  return (
    <div className="relative h-full min-h-[820px] w-full overflow-hidden border-r border-[var(--line-soft)] bg-black">
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
          return (
            <span
              key={line.id}
              className="absolute bg-[#8ab4f826] shadow-[0_0_6px_rgba(138,180,248,0.18)]"
              style={lineStyle(from, to, line.score)}
            />
          );
        })}
      </div>

      {sky.stars.map((star) => {
        const selected = star.memoId === selectedMemoId;
        return (
          <button
            key={star.id}
            type="button"
            onClick={() => onSelectMemo(star.memoId)}
            className={`absolute z-30 rounded-full transition ${
              selected
                ? "bg-[#8ab4f8] shadow-[0_0_16px_rgba(138,180,248,0.4)]"
                : "bg-[#8ab4f8dd] shadow-[0_0_10px_rgba(138,180,248,0.3)] hover:scale-110 hover:shadow-[0_0_14px_rgba(138,180,248,0.45)]"
            }`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              transform: "translate(-50%, -50%)",
            }}
            aria-label={`${star.category} のメモ`}
          />
        );
      })}
    </div>
  );
}

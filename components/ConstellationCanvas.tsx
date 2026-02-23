"use client";

import { useMemo } from "react";
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

function lineStyle(from: SkyStar, to: SkyStar) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    left: `${from.x}%`,
    top: `${from.y}%`,
    width: `${length}%`,
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
    <div className="relative h-full w-full overflow-hidden border-r border-[var(--line-soft)] bg-black">
      <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${sky.backgroundImage})` }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_42%,rgba(138,180,248,0.12),rgba(0,0,0,0)_55%)]" />

      {sky.zones.map((zone) => (
        <div
          key={zone.id}
          className="absolute rounded-full border border-[#8ab4f80d] bg-[#8ab4f808]"
          style={{
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            width: `${zone.size}%`,
            height: `${zone.size}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className={`absolute left-[30%] top-[12%] flex items-center gap-1 text-[13px] font-medium ${categoryTone[zone.category]}`}>
            <span>{zone.category}</span>
            <span className="text-[11px] text-[#8ab4f866]">{zone.count}</span>
          </div>
        </div>
      ))}

      <div className="absolute inset-0">
        {sky.links.map((line) => {
          const from = starsById.get(line.from);
          const to = starsById.get(line.to);
          if (!from || !to) return null;
          return <span key={line.id} className="absolute h-px bg-[#8ab4f826]" style={lineStyle(from, to)} />;
        })}
      </div>

      {sky.stars.map((star) => {
        const selected = star.memoId === selectedMemoId;
        return (
          <button
            key={star.id}
            type="button"
            onClick={() => onSelectMemo(star.memoId)}
            className={`absolute rounded-full transition ${
              selected
                ? "bg-[#8ab4f8] shadow-[0_0_18px_rgba(138,180,248,0.55)]"
                : "bg-[#8ab4f8cc] shadow-[0_0_12px_rgba(138,180,248,0.35)] hover:scale-110 hover:shadow-[0_0_16px_rgba(138,180,248,0.45)]"
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

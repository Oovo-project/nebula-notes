"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import StatusPill from "@/components/StatusPill";
import { useRecordingUi } from "@/components/RecordingProvider";

const links = [
  { href: "/", label: "ホーム", match: (path: string) => path === "/" },
  { href: "/inbox", label: "受信トレイ", match: (path: string) => path.startsWith("/inbox") || path.startsWith("/memo/") },
  { href: "/about", label: "このアプリについて", match: (path: string) => path.startsWith("/about") },
];

function WaveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 10h1.6M6 7v6M9 5v10M12 7v6M15 9.2v1.6M17 10h-1" stroke="#8ab4f8" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="2" width="4" height="4" rx="1" stroke="#9ca3af" strokeWidth="1" />
      <rect x="12" y="2" width="4" height="4" rx="1" stroke="#9ca3af" strokeWidth="1" />
      <rect x="2" y="12" width="4" height="4" rx="1" stroke="#9ca3af" strokeWidth="1" />
      <rect x="12" y="12" width="4" height="4" rx="1" stroke="#9ca3af" strokeWidth="1" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { status, elapsedSeconds } = useRecordingUi();

  return (
    <header className="relative z-20 flex h-16 items-center justify-between border-b border-[var(--line-soft)] px-8 max-[980px]:h-auto max-[980px]:flex-wrap max-[980px]:gap-3 max-[980px]:px-4 max-[980px]:py-3">
      <div className="flex items-center gap-8 max-[980px]:gap-4">
        <Link href="/" className="flex items-center gap-2">
          <WaveIcon />
          <span className="text-[20px] font-bold tracking-tight text-white">nebula notes</span>
        </Link>
        <span className="h-6 w-px bg-white/10" aria-hidden />
        <nav className="flex items-center gap-8 max-[980px]:gap-4" aria-label="Main">
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-[14px] font-medium transition-colors ${active ? "text-white" : "text-[var(--text-muted)]"}`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-px bg-[var(--text-accent)] shadow-[0_0_8px_rgba(138,180,248,0.45)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <StatusPill status={status} seconds={elapsedSeconds} />
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-transparent transition hover:border-white/10"
          aria-label="グリッドメニュー"
        >
          <GridIcon />
        </button>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import ConstellationCanvas from "@/components/ConstellationCanvas";
import FilterChips from "@/components/FilterChips";
import InboxPreviewPanel from "@/components/InboxPreviewPanel";
import SearchBar from "@/components/SearchBar";
import { buildConstellationSky } from "@/lib/constellation";
import { mockInboxMemos, mockSky } from "@/lib/mock";
import { toUiMemo, type ApiMemoItem } from "@/lib/memo-normalizer";
import type { Memo, PeriodFilter } from "@/lib/types";

type MemosResponse = {
  items: ApiMemoItem[];
};

export default function InboxPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [category, setCategory] = useState<string>("すべて");
  const [memos, setMemos] = useState<Memo[]>(mockInboxMemos);
  const [loadError, setLoadError] = useState<string>("");
  const [selectedMemoId, setSelectedMemoId] = useState<string>("");
  const [deletingMemoId, setDeletingMemoId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchMemos = async () => {
      const response = await fetch("/api/memos?limit=80", { cache: "no-store" });
      if (!response.ok) {
        if (!ignore) setLoadError("inboxの同期に失敗しました（mock表示中）");
        return;
      }
      const payload = (await response.json()) as MemosResponse;
      const mapped = payload.items.map((item) => toUiMemo(item));
      if (ignore) return;
      if (mapped.length > 0) {
        setMemos(mapped);
        setLoadError("");
      }
      if (mapped.length > 0 && !mapped.some((memo) => memo.id === selectedMemoId)) {
        setSelectedMemoId(mapped[0].id);
      }
    };

    fetchMemos().catch(() => {
      if (!ignore) setLoadError("inboxの同期に失敗しました（mock表示中）");
    });

    return () => {
      ignore = true;
    };
  }, []);

  const visibleMemos = useMemo(() => {
    return memos.filter((memo) => {
      const byCategory = category === "すべて" || memo.category === category;
      const bySearch =
        search.length === 0 || memo.title.includes(search) || memo.summary.includes(search) || memo.category.includes(search);
      const byPeriod = period === "all" ? true : true;
      return byCategory && bySearch && byPeriod;
    });
  }, [category, memos, period, search]);

  useEffect(() => {
    if (visibleMemos.length === 0) return;
    if (!visibleMemos.some((memo) => memo.id === selectedMemoId)) {
      setSelectedMemoId(visibleMemos[0].id);
    }
  }, [selectedMemoId, visibleMemos]);

  const selectedMemo = visibleMemos.find((memo) => memo.id === selectedMemoId) ?? null;

  const sky = useMemo(() => buildConstellationSky(visibleMemos, mockSky), [visibleMemos]);

  const handleDeleteMemo = async (memoId: string) => {
    if (deletingMemoId) return;
    setDeletingMemoId(memoId);
    setLoadError("");
    try {
      const response = await fetch(`/api/memos/${memoId}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) {
        throw new Error("delete failed");
      }
      setMemos((prev) => prev.filter((memo) => memo.id !== memoId));
      setSelectedMemoId((prev) => (prev === memoId ? "" : prev));
    } catch {
      setLoadError("削除に失敗しました。時間をおいて再試行してください。");
    } finally {
      setDeletingMemoId(null);
    }
  };

  return (
    <main className="flex-1 max-[1024px]:h-auto max-[1024px]:min-h-0" style={{ height: "900px", minHeight: "900px" }}>
      <section className="flex h-full min-h-0 max-[1024px]:flex-col">
        <div className="relative h-full min-h-0 flex-1 max-[1024px]:min-h-[520px]">
          <div className="absolute left-4 right-4 top-4 z-10 space-y-3">
            <div className="flex items-center gap-3">
              <SearchBar value={search} onChange={setSearch} />
              <FilterChips items={mockSky.periods} active={period} size="sm" onSelect={(value) => setPeriod(value as PeriodFilter)} />
            </div>
            <FilterChips items={mockSky.categories} active={category} onSelect={setCategory} />
            {loadError && <p className="text-[11px] text-[#f59e0b]">{loadError}</p>}
          </div>

          <ConstellationCanvas
            sky={sky}
            selectedMemoId={selectedMemoId}
            onSelectMemo={setSelectedMemoId}
          />
        </div>

        <InboxPreviewPanel memo={selectedMemo} onDelete={handleDeleteMemo} deleting={selectedMemo?.id === deletingMemoId} />
      </section>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import ConstellationCanvas from "@/components/ConstellationCanvas";
import FilterChips from "@/components/FilterChips";
import InboxPreviewPanel from "@/components/InboxPreviewPanel";
import SearchBar from "@/components/SearchBar";
import { mockRecentMemos, mockSky } from "@/lib/mock";
import type { Memo, PeriodFilter } from "@/lib/types";

export default function InboxPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [category, setCategory] = useState<string>("すべて");
  const [selectedMemoId, setSelectedMemoId] = useState<string>(mockRecentMemos[0]?.id ?? "");

  const visibleMemos = useMemo(() => {
    return mockRecentMemos.filter((memo) => {
      const byCategory = category === "すべて" || memo.category === category;
      const bySearch =
        search.length === 0 || memo.title.includes(search) || memo.summary.includes(search) || memo.category.includes(search);
      const byPeriod = period === "all" ? true : true;
      return byCategory && bySearch && byPeriod;
    });
  }, [category, period, search]);

  const selectedMemo =
    visibleMemos.find((memo) => memo.id === selectedMemoId) ??
    mockRecentMemos.find((memo) => memo.id === selectedMemoId) ??
    mockRecentMemos[0];

  const selectableIds = new Set(visibleMemos.map((memo) => memo.id));

  const sky = useMemo(
    () => ({
      ...mockSky,
      stars: mockSky.stars.filter((star) => {
        const byCategory = category === "すべて" || star.category === category;
        const byMemo = selectableIds.has(star.memoId);
        return byCategory && byMemo;
      }),
      links: mockSky.links.filter((line) => {
        const from = mockSky.stars.find((star) => star.id === line.from);
        const to = mockSky.stars.find((star) => star.id === line.to);
        return !!from && !!to && selectableIds.has(from.memoId) && selectableIds.has(to.memoId);
      }),
    }),
    [category, selectableIds]
  );

  return (
    <main className="h-[calc(100vh-64px)] min-h-[836px] flex-1 max-[1024px]:h-auto max-[1024px]:min-h-0">
      <section className="flex h-full max-[1024px]:flex-col">
        <div className="relative h-full flex-1 max-[1024px]:min-h-[520px]">
          <div className="absolute left-4 right-4 top-4 z-10 space-y-3">
            <div className="flex items-center gap-3">
              <SearchBar value={search} onChange={setSearch} />
              <FilterChips items={mockSky.periods} active={period} size="sm" onSelect={(value) => setPeriod(value as PeriodFilter)} />
            </div>
            <FilterChips items={mockSky.categories} active={category} onSelect={setCategory} />
          </div>

          <ConstellationCanvas sky={sky} selectedMemoId={selectedMemoId} onSelectMemo={setSelectedMemoId} />
        </div>

        <InboxPreviewPanel memo={selectedMemo as Memo} />
      </section>
    </main>
  );
}

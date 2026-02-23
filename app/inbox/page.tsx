"use client";

import { useEffect, useMemo, useState } from "react";
import ConstellationCanvas from "@/components/ConstellationCanvas";
import FilterChips from "@/components/FilterChips";
import InboxPreviewPanel from "@/components/InboxPreviewPanel";
import SearchBar from "@/components/SearchBar";
import { mockInboxMemos, mockSky } from "@/lib/mock";
import { buildConstellationSky } from "@/lib/constellation";
import type { Memo, PeriodFilter } from "@/lib/types";

export default function InboxPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [category, setCategory] = useState<string>("すべて");
  const [selectedMemoId, setSelectedMemoId] = useState<string>(mockInboxMemos[0]?.id ?? "");

  const visibleMemos = useMemo(() => {
    return mockInboxMemos.filter((memo) => {
      const byCategory = category === "すべて" || memo.category === category;
      const bySearch =
        search.length === 0 || memo.title.includes(search) || memo.summary.includes(search) || memo.category.includes(search);
      const byPeriod = period === "all" ? true : true;
      return byCategory && bySearch && byPeriod;
    });
  }, [category, period, search]);

  useEffect(() => {
    if (visibleMemos.length === 0) return;
    if (!visibleMemos.some((memo) => memo.id === selectedMemoId)) {
      setSelectedMemoId(visibleMemos[0].id);
    }
  }, [selectedMemoId, visibleMemos]);

  const selectedMemo =
    visibleMemos.find((memo) => memo.id === selectedMemoId) ??
    mockInboxMemos.find((memo) => memo.id === selectedMemoId) ??
    mockInboxMemos[0];

  const sky = useMemo(() => buildConstellationSky(visibleMemos, mockSky), [visibleMemos]);

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

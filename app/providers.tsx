"use client";

import { RecordingProvider } from "@/components/RecordingProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <RecordingProvider>{children}</RecordingProvider>;
}

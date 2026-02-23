"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { HomeStatus } from "@/lib/types";

type RecordingContextValue = {
  status: HomeStatus;
  elapsedSeconds: number;
  errorMessage: string;
  startRecording: () => void;
  stopRecording: () => void;
  setError: (message: string) => void;
  reset: () => void;
};

const RecordingContext = createContext<RecordingContextValue | null>(null);

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<HomeStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(4);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const timeoutRef = useRef<number[]>([]);

  useEffect(() => {
    if (status !== "recording") return;
    const timer = window.setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const clearTimers = useCallback(() => {
    timeoutRef.current.forEach((id) => window.clearTimeout(id));
    timeoutRef.current = [];
  }, []);

  const startRecording = useCallback(() => {
    clearTimers();
    setErrorMessage("");
    setElapsedSeconds(0);
    setStatus("recording");
  }, [clearTimers]);

  const stopRecording = useCallback(() => {
    clearTimers();
    setStatus("uploading");
    timeoutRef.current.push(
      window.setTimeout(() => setStatus("processing"), 1200),
      window.setTimeout(() => {
        setStatus("idle");
        setElapsedSeconds(0);
      }, 3000)
    );
  }, [clearTimers]);

  const setError = useCallback(
    (message: string) => {
      clearTimers();
      setErrorMessage(message);
      setStatus("error");
    },
    [clearTimers]
  );

  const reset = useCallback(() => {
    clearTimers();
    setStatus("idle");
    setElapsedSeconds(0);
    setErrorMessage("");
  }, [clearTimers]);

  const value = useMemo(
    () => ({
      status,
      elapsedSeconds,
      errorMessage,
      startRecording,
      stopRecording,
      setError,
      reset,
    }),
    [elapsedSeconds, errorMessage, reset, setError, startRecording, status, stopRecording]
  );

  return <RecordingContext.Provider value={value}>{children}</RecordingContext.Provider>;
}

export function useRecordingUi() {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error("useRecordingUi must be used inside RecordingProvider");
  }
  return context;
}

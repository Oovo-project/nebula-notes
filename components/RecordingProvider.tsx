"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { HomeStatus } from "@/lib/types";

type RecordingContextValue = {
  status: HomeStatus;
  elapsedSeconds: number;
  errorMessage: string;
  refreshKey: number;
  recordingSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  setError: (message: string) => void;
  reset: () => void;
};

const RecordingContext = createContext<RecordingContextValue | null>(null);

function pickMimeType(): string | undefined {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
}

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<HomeStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [recordingSupported, setRecordingSupported] = useState<boolean>(true);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const statusDelayRef = useRef<number | null>(null);

  useEffect(() => {
    const supported = typeof window !== "undefined" && !!window.MediaRecorder && !!navigator.mediaDevices?.getUserMedia;
    setRecordingSupported(supported);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearStatusDelay = useCallback(() => {
    if (statusDelayRef.current !== null) {
      window.clearTimeout(statusDelayRef.current);
      statusDelayRef.current = null;
    }
  }, []);

  const stopStreamTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const setError = useCallback(
    (message: string) => {
      clearTimer();
      clearStatusDelay();
      stopStreamTracks();
      setStatus("error");
      setErrorMessage(message);
    },
    [clearStatusDelay, clearTimer, stopStreamTracks]
  );

  const uploadAudio = useCallback(async (blob: Blob) => {
    const file = new File([blob], `memo-${Date.now()}.webm`, { type: blob.type || "audio/webm" });
    const formData = new FormData();
    formData.append("audio", file);

    const response = await fetch("/api/memos", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "音声処理に失敗しました");
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!recordingSupported) {
      setError("このブラウザは録音に対応していません");
      return;
    }

    if (status === "uploading" || status === "processing") return;

    clearTimer();
    clearStatusDelay();
    setErrorMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        clearTimer();
        stopStreamTracks();

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];

        setStatus("uploading");
        statusDelayRef.current = window.setTimeout(() => setStatus("processing"), 800);

        try {
          await uploadAudio(blob);
          clearStatusDelay();
          setStatus("idle");
          setElapsedSeconds(0);
          setRefreshKey((prev) => prev + 1);
        } catch (error) {
          setError(error instanceof Error ? error.message : "音声処理に失敗しました");
        }
      };

      recorder.start();
      setElapsedSeconds(0);
      setStatus("recording");
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "マイクアクセスが拒否されました"
          : error instanceof DOMException && error.name === "NotFoundError"
            ? "マイクデバイスが見つかりません"
            : "録音を開始できませんでした";
      setError(message);
    }
  }, [clearStatusDelay, clearTimer, recordingSupported, setError, status, stopStreamTracks, uploadAudio]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.stop();
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    clearStatusDelay();
    stopStreamTracks();
    setStatus("idle");
    setElapsedSeconds(0);
    setErrorMessage("");
  }, [clearStatusDelay, clearTimer, stopStreamTracks]);

  useEffect(() => {
    return () => {
      clearTimer();
      clearStatusDelay();
      stopStreamTracks();
    };
  }, [clearStatusDelay, clearTimer, stopStreamTracks]);

  const value = useMemo(
    () => ({
      status,
      elapsedSeconds,
      errorMessage,
      refreshKey,
      recordingSupported,
      startRecording,
      stopRecording,
      setError,
      reset,
    }),
    [elapsedSeconds, errorMessage, recordingSupported, refreshKey, reset, setError, startRecording, status, stopRecording]
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

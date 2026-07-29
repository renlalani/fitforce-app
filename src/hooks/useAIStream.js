import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { streamAI } from "../utils/api";

export default function useAIStream() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const busyRef = useRef(false);

  const stream = useCallback(async ({ system, messages, maxTokens = 2048, onChunk }) => {
    if (busyRef.current) {
      const err = new Error("Request already in progress");
      err.code = "LOCKED";
      throw err;
    }

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    busyRef.current = true;
    setLoading(true);
    setError(null);

    let fullText = "";
    try {
      await streamAI({
        messages,
        system,
        maxTokens,
        signal: controller.signal,
        onChunk: (text) => {
          fullText = text;
          return onChunk?.(text);
        },
      });
      setLoading(false);
      busyRef.current = false;
      abortRef.current = null;
      return fullText;
    } catch (e) {
      setLoading(false);
      busyRef.current = false;
      abortRef.current = null;
      if (e.code === "LOCKED") throw e;
      if (e.name === "AbortError") return null;
      setError(e.message || "Connection failed. Try again.");
      throw e;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    busyRef.current = false;
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const result = useMemo(() => ({ stream, cancel, loading, error }), [stream, cancel]);

  return result;
}

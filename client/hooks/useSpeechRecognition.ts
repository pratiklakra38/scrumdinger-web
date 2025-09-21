import { useCallback, useEffect, useRef, useState } from "react";

export interface SpeechResult {
  text: string;
  isFinal: boolean;
}

export function useSpeechRecognition(start: boolean) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpeechResult | null>(null);

  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e: any) => setError(e?.message || "Speech recognition error");
    rec.onresult = (ev: any) => {
      let transcript = "";
      let isFinal = false;
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        transcript += ev.results[i][0].transcript;
        if (ev.results[i].isFinal) isFinal = true;
      }
      setResult({ text: transcript.trim(), isFinal });
    };

    recognitionRef.current = rec;

    return () => {
      try { rec.stop(); } catch {}
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (start && !listening) {
      try { setError(null); rec.start(); } catch {}
    } else if (!start && listening) {
      try { rec.stop(); } catch {}
    }
  }, [start, listening]);

  const reset = useCallback(() => setResult(null), []);

  return { supported, listening, error, result, reset } as const;
}

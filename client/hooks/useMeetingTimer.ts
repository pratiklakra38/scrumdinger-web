import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface TimerConfig {
  meetingSeconds: number;
  perSpeakerSeconds: number;
  speakersCount: number;
}

function beep(duration = 180, frequency = 740) {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration / 1000);
    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, duration + 20);
  } catch {}
}

export function useMeetingTimer(config: TimerConfig, running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const [speakerIndex, setSpeakerIndex] = useState(0);
  const [speakerElapsed, setSpeakerElapsed] = useState(0);
  const [paused, setPaused] = useState(!running);

  const total = config.meetingSeconds;
  const per = config.perSpeakerSeconds;
  const speakers = config.speakersCount;

  const remaining = Math.max(total - elapsed, 0);
  const speakerRemaining = Math.max(per - speakerElapsed, 0);

  useEffect(() => setPaused(!running), [running]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setElapsed((e) => Math.min(e + 1, total));
      setSpeakerElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [paused, total]);

  useEffect(() => {
    if (speakerRemaining === 0 && !paused) {
      beep();
      nextSpeaker();
    }
  }, [speakerRemaining, paused]);

  useEffect(() => {
    if (remaining === 0 && !paused) {
      beep(250, 520);
      setPaused(true);
    }
  }, [remaining, paused]);

  const nextSpeaker = useCallback(() => {
    setSpeakerIndex((i) => (i + 1) % speakers);
    setSpeakerElapsed(0);
  }, [speakers]);

  const prevSpeaker = useCallback(() => {
    setSpeakerIndex((i) => (i - 1 + speakers) % speakers);
    setSpeakerElapsed(0);
  }, [speakers]);

  const toggle = useCallback(() => setPaused((p) => !p), []);
  const reset = useCallback(() => {
    setElapsed(0);
    setSpeakerElapsed(0);
    setSpeakerIndex(0);
    setPaused(true);
  }, []);

  const progress = useMemo(() => (elapsed / total) * 100, [elapsed, total]);
  const speakerProgress = useMemo(() => (speakerElapsed / per) * 100, [speakerElapsed, per]);

  return {
    elapsed,
    remaining,
    speakerIndex,
    speakerElapsed,
    speakerRemaining,
    progress,
    speakerProgress,
    paused,
    nextSpeaker,
    prevSpeaker,
    toggle,
    reset,
  } as const;
}

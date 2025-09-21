import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Scrum, MeetingRecord, TranscriptEntry } from "../../shared/api";
import { findScrum, upsertScrum } from "../lib/storage";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import CircularParticipants from "../components/meeting/CircularParticipants";
import Header from "../components/app/Header";
import { useMeetingTimer } from "../hooks/useMeetingTimer";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export default function Meeting() {
  const params = useParams();
  const navigate = useNavigate();
  const scrum = findScrum(params.id || "");

  const [running, setRunning] = useState(true);
  const order = useMemo(() => scrum?.attendees.map((a) => a.id) ?? [], [scrum]);
  const timer = useMeetingTimer(
    {
      meetingSeconds: (scrum?.config.durationMinutes || 15) * 60,
      perSpeakerSeconds: scrum?.config.speakerSeconds || 60,
      speakersCount: order.length || 1,
    },
    running,
  );

  const activeAttendee = useMemo(
    () => (scrum ? scrum.attendees[timer.speakerIndex] : undefined),
    [scrum, timer.speakerIndex],
  );

  const [record, setRecord] = useState<MeetingRecord | null>(() =>
    scrum
      ? {
          id: crypto.randomUUID(),
          scrumId: scrum.id,
          startedAt: Date.now(),
          endedAt: null,
          order,
          transcript: [],
          completed: false,
        }
      : null,
  );

  const { supported, result, reset } = useSpeechRecognition(running);
  const lastSpeakerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!scrum || !record) return;
    if (!result) return;

    const attendeeId = activeAttendee?.id ?? null;
    // Avoid spamming interim empty results
    if (!result.text) return;

    const entry: TranscriptEntry = {
      id: crypto.randomUUID(),
      attendeeId,
      text: result.text,
      at: Date.now(),
    };
    setRecord((r) => (r ? { ...r, transcript: [...r.transcript, entry] } : r));
    if (result.isFinal) reset();
    lastSpeakerIdRef.current = attendeeId;
  }, [result, activeAttendee, scrum, record, reset]);

  useEffect(() => {
    if (!scrum || !record) return;
    if (timer.remaining === 0) {
      const completed: MeetingRecord = { ...record, endedAt: Date.now(), completed: true };
      const next = { ...scrum, history: [completed, ...scrum.history] } as Scrum;
      upsertScrum(next);
      setRecord(completed);
      setRunning(false);
      navigate(`/history?scrum=${scrum.id}`);
    }
  }, [timer.remaining, scrum, record, navigate]);

  if (!scrum) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="mb-4">Scrum not found.</p>
            <Link to="/">
              <Button>Back to Scrums</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const totalMins = Math.ceil(timer.remaining / 60);

  function handleFinish() {
    if (!scrum || !record) return;
    const completed: MeetingRecord = { ...record, endedAt: Date.now(), completed: true };
    const next = { ...scrum, history: [completed, ...scrum.history] } as Scrum;
    upsertScrum(next);
    navigate(`/history?scrum=${scrum.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col brand-gradient">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-[1fr_380px]">
          <section className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{scrum.name} Meeting</h1>
                <p className="text-sm text-muted-foreground">{scrum.attendees.length} attendees • {scrum.config.durationMinutes} min • {scrum.config.speakerSeconds}s/speaker</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-2xl font-extrabold tabular-nums">{Math.floor(timer.remaining/60)}:{String(timer.remaining%60).padStart(2, "0")}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center">
              {/* Timer circle */}
              <div
                className="relative grid place-items-center rounded-full"
                style={{ width: 320, height: 320, background: `conic-gradient(hsl(var(--primary)) ${timer.speakerProgress}%, hsl(var(--primary)/0.1) 0)` }}
              >
                <div className="absolute inset-4 rounded-full bg-background border" />
                <div className="relative z-10 text-center">
                  <p className="text-sm text-muted-foreground">{supported ? (timer.paused ? "Paused" : "Listening…") : "Speech not supported"}</p>
                  <p className="mt-1 text-3xl font-bold">{activeAttendee?.name ?? "Attendee"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{Math.floor(timer.speakerRemaining)}s left</p>
                </div>
              </div>

              <div className="mt-4">
                <CircularParticipants attendees={scrum.attendees} activeIndex={timer.speakerIndex} />
              </div>

              <div className="mt-6 flex gap-2">
                <Button onClick={() => timer.prevSpeaker()} variant="secondary">Prev</Button>
                <Button onClick={() => setRunning((r) => !r)}>{timer.paused ? "Resume" : "Pause"}</Button>
                <Button onClick={() => timer.nextSpeaker()} variant="secondary">Next</Button>
              </div>
            </div>
          </section>

          <aside className="bg-card rounded-xl p-6 shadow-sm border">
            <h2 className="font-semibold">Live Transcript</h2>
            <div className="mt-3 h-[420px] overflow-auto rounded-md border bg-background p-3 text-sm">
              {record?.transcript.length ? (
                <ul className="space-y-2">
                  {record.transcript.map((t) => (
                    <li key={t.id} className="flex gap-2">
                      <span className="shrink-0 text-muted-foreground tabular-nums">{new Date(t.at).toLocaleTimeString()}</span>
                      <span className="font-semibold">{scrum.attendees.find((a) => a.id === t.attendeeId)?.name || "System"}:</span>
                      <span className="break-words">{t.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Speak to start building the transcript. Microphone access may be required.</p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Meeting time remaining</p>
                <Progress value={timer.progress} className="h-2 w-40" />
              </div>
              <div className="flex gap-2">
                <Link to="/">
                  <Button variant="ghost">Exit</Button>
                </Link>
                <Button onClick={() => navigate(`/history?scrum=${scrum.id}`)}>Finish</Button>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">Notifications and scheduling can be enabled in Settings.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}

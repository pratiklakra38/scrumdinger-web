import { useEffect, useMemo, useState } from "react";
import type { Attendee, Scrum } from "../../shared/api";
import Header from "../components/app/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import NumberControl from "../components/form/NumberControl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { loadScrums, removeScrum, upsertScrum } from "../lib/storage";
import { Link, useNavigate } from "react-router-dom";

function randomColor(seed?: string) {
  const hue = Math.floor((seed ? seed.length * 47 : Math.random() * 360) % 360);
  return `hsl(${hue} 70% 50%)`;
}

function createNewScrum(): Scrum {
  return {
    id: crypto.randomUUID(),
    name: "New Scrum",
    attendees: [],
    config: {
      durationMinutes: 15,
      speakerSeconds: 60, // total seconds per speaker
      color: "hsl(var(--primary))",
      recurring: null,
    },
    history: [],
  };
}

export default function Index() {
  const [scrums, setScrums] = useState<Scrum[]>(loadScrums());
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Scrum | null>(null);
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("scrumdinger.hasVisited", "1");
  }, []);

  const startMeeting = (id: string) => navigate(`/meeting/${id}`);

  function saveScrum() {
    if (!edit) return;
    upsertScrum(edit);
    setScrums(loadScrums());
    setOpen(false);
  }

  function addAttendee() {
    if (!edit) return;
    const attendee: Attendee = {
      id: crypto.randomUUID(),
      name: "",
      color: randomColor(),
    };
    setEdit({ ...edit, attendees: [...edit.attendees, attendee] });
  }

  function removeAttendee(id: string) {
    if (!edit) return;
    setEdit({ ...edit, attendees: edit.attendees.filter((a) => a.id !== id) });
  }

  return (
    <div className="min-h-screen flex flex-col brand-gradient">
      <Header />
      <main className="mx-auto max-w-6xl flex-1 w-full px-4 py-8">
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Daily Scrum Manager
            </h1>
            <p className="text-muted-foreground">
              Create scrums, configure timing, run meetings with live
              transcription.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEdit(createNewScrum());
                }}
              >
                New Scrum
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {edit?.id ? "Edit Scrum" : "New Scrum"}
                </DialogTitle>
              </DialogHeader>
              {edit && (
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={edit.name}
                      onChange={(e) =>
                        setEdit({ ...edit, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Meeting Duration (minutes)
                    </label>
                    <NumberControl
                      value={edit.config.durationMinutes}
                      min={1}
                      step={1}
                      onChange={(v) =>
                        setEdit({
                          ...edit,
                          config: { ...edit.config, durationMinutes: v },
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Speaker Time Limit
                    </label>
                    <div className="flex items-center gap-4">
                      <NumberControl
                        label="minutes"
                        value={Math.floor(edit.config.speakerSeconds / 60)}
                        min={0}
                        step={1}
                        onChange={(mins) => {
                          const secs = edit.config.speakerSeconds % 60;
                          setEdit({
                            ...edit,
                            config: {
                              ...edit.config,
                              speakerSeconds: mins * 60 + secs,
                            },
                          });
                        }}
                      />
                      <NumberControl
                        label="seconds"
                        value={edit.config.speakerSeconds % 60}
                        min={0}
                        max={59}
                        step={5}
                        onChange={(sec) => {
                          let mins = Math.floor(
                            edit.config.speakerSeconds / 60,
                          );
                          // if we try to set seconds beyond 59, roll into minutes
                          if (sec > 59) {
                            mins += Math.floor(sec / 60);
                            sec = sec % 60;
                          }
                          setEdit({
                            ...edit,
                            config: {
                              ...edit.config,
                              speakerSeconds: mins * 60 + sec,
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Seconds control rolls into minutes when exceeding 59s. Max
                      per-second display is 59s.
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Attendees</label>
                    <div className="space-y-2">
                      {edit.attendees.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          No attendees yet — add attendees using the button
                          below.
                        </div>
                      )}
                      {edit.attendees.map((a, i) => (
                        <div key={a.id} className="flex items-center gap-2">
                          <span
                            className="inline-block size-6 rounded-full"
                            style={{ backgroundColor: a.color }}
                          />
                          <Input
                            placeholder={`Member ${i + 1}`}
                            value={a.name}
                            onChange={(e) => {
                              const next = [...edit.attendees];
                              next[i] = { ...a, name: e.target.value };
                              setEdit({ ...edit, attendees: next });
                            }}
                          />
                          <Input
                            type="color"
                            value={
                              a.color.startsWith("hsl") ? "#000000" : a.color
                            }
                            onChange={(e) => {
                              const next = [...edit.attendees];
                              next[i] = { ...a, color: e.target.value };
                              setEdit({ ...edit, attendees: next });
                            }}
                            className="w-12 p-1"
                          />
                          <Button
                            variant="ghost"
                            onClick={() => removeAttendee(a.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div>
                      <Button variant="secondary" onClick={addAttendee}>
                        Add Attendee
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveScrum}>Save Scrum</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </section>

        <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scrums.map((s) => (
            <Card key={s.id} className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{s.name}</span>
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className="inline-block size-3 rounded-full"
                      style={{ backgroundColor: s.config.color }}
                    />
                    {s.attendees.length} people
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {s.config.durationMinutes} min • {s.config.speakerSeconds}
                  s/speaker
                </div>
                <div className="flex -space-x-2">
                  {s.attendees.slice(0, 6).map((a) => (
                    <div
                      key={a.id}
                      className="inline-flex size-7 items-center justify-center rounded-full ring-2 ring-background text-[11px] font-semibold text-white"
                      style={{ backgroundColor: a.color }}
                      title={a.name}
                    >
                      {a.name.slice(0, 1).toUpperCase()}
                    </div>
                  ))}
                  {s.attendees.length > 6 && (
                    <div className="inline-flex size-7 items-center justify-center rounded-full ring-2 ring-background bg-muted text-foreground text-[11px]">
                      +{s.attendees.length - 6}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => startMeeting(s.id)} className="flex-1">
                    Start
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEdit(s);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      removeScrum(s.id);
                      setScrums(loadScrums());
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!scrums.length && (
            <div className="col-span-full rounded-xl border bg-card p-8 text-center shadow-sm">
              <p className="text-lg font-medium">No scrums yet</p>
              <p className="text-muted-foreground">
                Create your first scrum to get started.
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => {
                    setEdit(createNewScrum());
                    setOpen(true);
                  }}
                >
                  Create Scrum
                </Button>
              </div>
            </div>
          )}
        </section>
        <div className="mt-6">
          <input
            type="text"
            value={meetingId}
            onChange={e => setMeetingId(e.target.value.toUpperCase())}
            placeholder="Enter Meeting Code (e.g. ABC123)"
            className="border px-4 py-2 rounded-lg mr-2"
          />
          <button
            onClick={() => meetingId && navigate(`/meeting/${meetingId}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Join Meeting
          </button>
        </div>
      </main>
    </div>
  );
}

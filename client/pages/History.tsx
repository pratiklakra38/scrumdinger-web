import Header from "../components/app/Header";
import { useMemo, useState } from "react";
import { loadScrums } from "../lib/storage";
import { Button } from "../components/ui/button";

function formatKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export default function History() {
  const scrums = loadScrums();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(null);

  const map = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const s of scrums) {
      for (const h of s.history) {
        const key = new Date(h.startedAt).toISOString().slice(0, 10);
        m[key] = m[key] || [];
        m[key].push({ scrum: s, record: h });
      }
    }
    return m;
  }, [scrums]);

  const recent = useMemo(() => {
    const all: any[] = [];
    for (const s of scrums) {
      for (const h of s.history) {
        all.push({ scrum: s, record: h });
      }
    }
    all.sort((a, b) => b.record.startedAt - a.record.startedAt);
    return all.slice(0, 6);
  }, [scrums]);

  const first = startOfMonth(cursor);
  const last = endOfMonth(cursor);
  const startDay = new Date(first);
  startDay.setDate(1 - ((first.getDay() + 6) % 7)); // Monday-start

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    days.push(d);
  }

  function prevMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meeting History</h1>
            <p className="text-muted-foreground">
              Monthly view of archived meetings and transcripts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={prevMonth}>
              Prev
            </Button>
            <div className="px-3 py-2 rounded text-sm font-medium">
              {cursor.toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </div>
            <Button variant="ghost" onClick={nextMonth}>
              Next
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-xs text-muted-foreground text-center">
              {d}
            </div>
          ))}

          {days.map((d) => {
            const key = formatKey(d);
            const items = map[key] || [];
            const isCurrentMonth = d.getMonth() === cursor.getMonth();
            const isSelected = selected === key;
            return (
              <button
                key={key}
                onClick={() => setSelected(isSelected ? null : key)}
                className={`p-2 h-14 text-left rounded-lg border text-xs ${isCurrentMonth ? "bg-card" : "bg-background/60 text-muted-foreground"} ${isSelected ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-sm font-medium">{d.getDate()}</div>
                  {items.length > 0 && (
                    <div className="text-[11px] bg-primary text-primary-foreground rounded px-2 py-0.5">
                      {items.length}
                    </div>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {items.slice(0, 1).map((it, i) => (
                    <div key={i} className="truncate">
                      {it.scrum.name} •{" "}
                      {new Date(it.record.startedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  ))}
                  {items.length > 1 && (
                    <div className="text-[11px] text-muted-foreground">
                      +{items.length - 1} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent meetings always shown below calendar */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Meetings</h2>
            <div className="text-sm text-muted-foreground">
              Most recent first
            </div>
          </div>
          <div className="mt-3 rounded-xl border bg-card p-4">
            {recent.length ? (
              <ul className="space-y-2">
                {recent.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.scrum.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(it.record.startedAt).toLocaleString()} •{" "}
                        {it.record.transcript.length} transcript entries
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const blob = new Blob(
                            [JSON.stringify(it.record, null, 2)],
                            { type: "application/json" },
                          );
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${it.scrum.name}-${new Date(it.record.startedAt).toISOString().slice(0, 10)}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        Export
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">
                No recent meetings.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          {selected ? (
            <div className="rounded-xl border bg-card p-4">
              <h2 className="font-semibold">Meetings on {selected}</h2>
              <ul className="mt-3 space-y-2">
                {(map[selected] || []).map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.scrum.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(it.record.startedAt).toLocaleString()} •{" "}
                        {it.record.transcript.length} transcript entries
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const blob = new Blob(
                            [JSON.stringify(it.record, null, 2)],
                            { type: "application/json" },
                          );
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${it.scrum.name}-${selected}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        Export
                      </Button>
                    </div>
                  </li>
                ))}
                {(map[selected] || []).length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    No meetings on this day.
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-6 text-muted-foreground">
              Select a day to view meetings and transcripts.
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button onClick={() => window.history.back()}>Back</Button>
        </div>
      </main>
    </div>
  );
}

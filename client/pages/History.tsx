import { Link, useLocation } from "react-router-dom";
import { loadScrums, upsertScrum } from "../lib/storage";
import Header from "../components/app/Header";
import { Button } from "../components/ui/button";

export default function History() {
  const scrums = loadScrums();
  const params = new URLSearchParams(useLocation().search);
  const active = params.get("scrum");

  function exportJson(scrumId: string) {
    const scrum = scrums.find((s) => s.id === scrumId);
    if (!scrum) return;
    const blob = new Blob([JSON.stringify(scrum.history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${scrum.name}-history.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function clearHistory(scrumId: string) {
    const scrum = scrums.find((s) => s.id === scrumId);
    if (!scrum) return;
    scrum.history = [];
    upsertScrum(scrum);
    window.location.reload();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Meeting History</h1>
        <p className="text-muted-foreground">Archives and transcripts</p>

        <div className="mt-6 space-y-6">
          {scrums.map((s) => (
            <section key={s.id} className={`rounded-xl border bg-card p-4 shadow-sm ${active===s.id?"ring-2 ring-primary": ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{s.name}</h2>
                  <p className="text-xs text-muted-foreground">{s.history.length} meeting(s)</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => exportJson(s.id)}>Export</Button>
                  <Button variant="ghost" onClick={() => clearHistory(s.id)}>Clear</Button>
                </div>
              </div>
              <ul className="mt-3 divide-y">
                {s.history.map((m) => (
                  <li key={m.id} className="py-2 text-sm">
                    <span className="font-medium">{new Date(m.startedAt).toLocaleString()}</span>
                    <span className="mx-2">→</span>
                    <span>{m.completed ? "Completed" : "Incomplete"}</span>
                    <span className="mx-2 text-muted-foreground">• {m.transcript.length} transcript entries</span>
                  </li>
                ))}
                {!s.history.length && (
                  <li className="py-2 text-sm text-muted-foreground">No meetings yet.</li>
                )}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8">
          <Link to="/">
            <Button>Back to Scrums</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

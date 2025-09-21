import Header from "../components/app/Header";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";

export default function Settings() {
  const [notifications, setNotifications] = useState(Notification.permission === "granted");

  async function requestNotifications() {
    try {
      const perm = await Notification.requestPermission();
      setNotifications(perm === "granted");
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Meeting reminders</p>
              <p className="text-sm text-muted-foreground">Enable browser notifications for scheduled scrums.</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={notifications} onCheckedChange={(v) => (v ? requestNotifications() : setNotifications(false))} />
              <Button variant="secondary" onClick={requestNotifications}>Grant Permission</Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">For offline support and background notifications, add the app to your home screen or install as a PWA from the browser menu.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

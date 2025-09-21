import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function Header() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Scrums" },
    { to: "/history", label: "History" },
    { to: "/settings", label: "Settings" },
  ];

  const { user, signInMock, signOut } = useAuth();
  const [dark, setDark] = useState<boolean>(() => typeof window !== 'undefined' && (localStorage.getItem('scrum.theme') === 'dark'));

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('scrum.theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block size-6 rounded-md bg-gradient-to-br from-primary to-accent"></span>
          <span className="font-extrabold tracking-tight">ScrumDinger Web</span>
        </Link>
        <nav className="flex items-center gap-2">
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              <Button variant={pathname === l.to ? "default" : "ghost"} size="sm">
                {l.label}
              </Button>
            </Link>
          ))}

          <div className="flex items-center gap-2">
            <button aria-label="toggle-theme" className="px-2 py-1 rounded-md border" onClick={() => setDark(d => !d)}>
              {dark ? '🌙' : '☀️'}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-sm">{user.name}</div>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>Sign out</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => signInMock({ name: 'Guest User', email: 'guest@example.com' })}>Sign in with Google</Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

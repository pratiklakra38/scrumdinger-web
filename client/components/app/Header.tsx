import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";

export default function Header() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Scrums" },
    { to: "/history", label: "History" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block size-6 rounded-md bg-gradient-to-br from-primary to-accent"></span>
          <span className="font-extrabold tracking-tight">ScrumDinger Web</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              <Button
                variant={pathname === l.to ? "default" : "ghost"}
                size="sm"
              >
                {l.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

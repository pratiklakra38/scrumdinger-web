import React, { createContext, useContext, useEffect, useState } from "react";

interface User { name: string; email?: string; avatar?: string }

const AuthContext = createContext<{ user: User | null; signInMock: (u: User) => void; signOut: () => void }>({ user: null, signInMock: () => {}, signOut: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { const raw = localStorage.getItem('scrum.user'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  useEffect(() => {
    try { localStorage.setItem('scrum.user', JSON.stringify(user)); } catch {}
  }, [user]);

  function signInMock(u: User) {
    setUser(u);
  }
  function signOut() { setUser(null); }

  return (
    <AuthContext.Provider value={{ user, signInMock, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }

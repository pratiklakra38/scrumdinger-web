
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/auth/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Meeting from "./pages/Meeting";
import History from "./pages/History";
import Settings from "./pages/Settings";
import { AuthProvider } from "./components/auth/AuthProvider";
import Login from "./pages/Login";
import JoinMeeting from "./pages/JoinMeeting";
import MeetingPage from "./pages/Meeting";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/index"
              element={
                <RequireAuth>
                  <Index />
                </RequireAuth>
              }
            />
            <Route
              path="/join"
              element={
                <RequireAuth>
                  <JoinMeeting />
                </RequireAuth>
              }
            />
            <Route
              path="/meeting/:id"
              element={
                <RequireAuth>
                  <MeetingPage />
                </RequireAuth>
              }
            />
            <Route
              path="/history"
              element={
                <RequireAuth>
                  <History />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Prevent createRoot being called multiple times during HMR or re-execution
const container = document.getElementById("root");
if (container) {
  const anyWin = window as any;
  if (!anyWin.__react_root) {
    anyWin.__react_root = createRoot(container);
  }
  anyWin.__react_root.render(<App />);
} else {
  // Fallback: try to render directly
  try {
    createRoot(document.body.appendChild(document.createElement("div"))).render(
      <App />,
    );
  } catch (e) {
    // ignore
  }
}

import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Meeting from "./pages/Meeting";
import History from "./pages/History";
import Settings from "./pages/Settings";
import { AuthProvider } from "./components/auth/AuthProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* auth */}
      <import-none />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/meeting/:id" element={<Meeting />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
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
    createRoot(document.body.appendChild(document.createElement('div'))).render(<App />);
  } catch (e) {
    // ignore
  }
}

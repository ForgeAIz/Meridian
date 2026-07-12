// ─── ThemeProvider ──────────────────────────────────────────────────────────
// Reads the user's theme preference from settings and applies the `dark` class
// to the document element. For unauthenticated users, respects system preference.

"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { settings, isLoading: settingsLoading } = useSettings();

  useEffect(() => {
    const html = document.documentElement;

    // Not logged in yet — use system preference
    if (!user && authLoading) return;

    if (!user) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      html.classList.toggle("dark", prefersDark);

      const listener = (e: MediaQueryListEvent) => {
        html.classList.toggle("dark", e.matches);
      };
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }

    // Logged in — use saved setting
    if (settings && !settingsLoading) {
      html.classList.toggle("dark", settings.theme === "dark");
    }
  }, [user, authLoading, settings, settingsLoading]);

  return <>{children}</>;
}

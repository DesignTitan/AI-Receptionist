"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "./icons";

/**
 * Light/dark switch. The initial class is set by an inline script in the
 * layout, so this only mirrors what is already on <html> — no flash, no
 * hydration mismatch from reading localStorage during render.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setReady(true);
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private browsing — the choice just won't persist.
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex size-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:text-ink hover:border-line-strong ${className}`}
    >
      <span className={ready ? "" : "opacity-0"}>{dark ? <Sun /> : <Moon />}</span>
    </button>
  );
}

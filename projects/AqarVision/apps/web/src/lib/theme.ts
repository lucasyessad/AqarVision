"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored ?? "light";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  function applyTheme(t: Theme) {
    const resolved =
      t === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : t;
    document.documentElement.setAttribute("data-theme", resolved);
    document.cookie = `theme=${resolved};path=/;max-age=31536000`;
  }

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setThemeState(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return { theme, toggle };
}

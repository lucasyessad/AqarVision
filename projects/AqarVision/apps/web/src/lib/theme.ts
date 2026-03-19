"use client";

const THEME_KEY = "aqarvision-theme";

export type Theme = "light" | "dark";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(THEME_KEY) as Theme) ?? "light";
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `theme=${theme};path=/;max-age=31536000;SameSite=Lax`;
}

export function toggleTheme() {
  const current = getTheme();
  setTheme(current === "light" ? "dark" : "light");
}

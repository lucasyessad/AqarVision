"use client";

import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="flex size-9 items-center justify-center rounded-md text-zinc-500 transition-all duration-fast hover:bg-zinc-100 dark:bg-zinc-800 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      aria-label={theme === "dark" ? "Mode clair" : "Mode sombre"}
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}

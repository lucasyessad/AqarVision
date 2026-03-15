# Design Tokens — Zinc Design System

## Complete Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Zinc neutral ramp (core palette) ──────────────────
        zinc: {
          50:  "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#09090B",
        },

        // ── Amber accent (warm, action-oriented) ──────────────
        amber: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          950: "#451A03",
        },

        // ── Semantic aliases ──────────────────────────────────
        surface:    "var(--bg-surface)",
        "surface-muted":  "var(--bg-muted)",
        "surface-elevated": "var(--bg-elevated)",
        primary:    "var(--text-primary)",
        secondary:  "var(--text-secondary)",
        tertiary:   "var(--text-tertiary)",
        accent:     "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-ghost": "var(--accent-ghost)",

        // ── Status colors ─────────────────────────────────────
        success:    { DEFAULT: "#22C55E", ghost: "rgba(34,197,94,0.08)" },
        warning:    { DEFAULT: "#F59E0B", ghost: "rgba(245,158,11,0.08)" },
        danger:     { DEFAULT: "#EF4444", ghost: "rgba(239,68,68,0.08)" },
        info:       { DEFAULT: "#3B82F6", ghost: "rgba(59,130,246,0.08)" },

        // ── Real estate specific ──────────────────────────────
        "listing-sale":     "#3B82F6",
        "listing-rent":     "#8B5CF6",
        "listing-vacation": "#F59E0B",
        "status-draft":     "#71717A",
        "status-pending":   "#F59E0B",
        "status-published": "#22C55E",
        "status-paused":    "#A1A1AA",
        "status-rejected":  "#EF4444",
        "status-sold":      "#3B82F6",
      },

      fontFamily: {
        display: ["Geist", "system-ui", "sans-serif"],
        body:    ["Geist", "system-ui", "sans-serif"],
        arabic:  ["IBM Plex Sans Arabic", "Noto Sans Arabic", "sans-serif"],
        mono:    ["Geist Mono", "JetBrains Mono", "monospace"],
      },

      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],      // 11px
        xs:    ["0.75rem",   { lineHeight: "1rem" }],       // 12px
        sm:    ["0.8125rem", { lineHeight: "1.25rem" }],    // 13px
        base:  ["0.875rem",  { lineHeight: "1.25rem" }],    // 14px — default body
        md:    ["1rem",      { lineHeight: "1.5rem" }],     // 16px
        lg:    ["1.125rem",  { lineHeight: "1.75rem" }],    // 18px
        xl:    ["1.25rem",   { lineHeight: "1.75rem" }],    // 20px
        "2xl": ["1.5rem",    { lineHeight: "2rem" }],       // 24px
        "3xl": ["1.875rem",  { lineHeight: "2.25rem" }],    // 30px
        "4xl": ["2.25rem",   { lineHeight: "2.5rem" }],     // 36px
        "5xl": ["3rem",      { lineHeight: "1" }],          // 48px
      },

      spacing: {
        "4.5": "1.125rem",   // 18px
        "13":  "3.25rem",    // 52px
        "15":  "3.75rem",    // 60px
        "18":  "4.5rem",     // 72px
        "88":  "22rem",      // 352px (sidebar expanded)
        "16s": "4rem",       // 64px (sidebar collapsed)
      },

      borderRadius: {
        sm:    "4px",
        DEFAULT: "6px",
        md:    "6px",
        lg:    "8px",
        xl:    "12px",
        "2xl": "16px",
      },

      boxShadow: {
        xs:  "0 1px 2px rgba(0,0,0,0.05)",
        sm:  "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        md:  "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
        lg:  "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)",
        xl:  "0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)",
        card:      "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "card-hover": "0 8px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)",
        ring:      "0 0 0 2px var(--accent)",
        "ring-offset": "0 0 0 2px var(--bg-surface), 0 0 0 4px var(--accent)",
      },

      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        spring:  "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      transitionDuration: {
        fast:    "100ms",
        normal:  "200ms",
        slow:    "300ms",
        slower:  "500ms",
      },

      keyframes: {
        "fade-in":      { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out":     { from: { opacity: "1" }, to: { opacity: "0" } },
        "slide-up":     { from: { transform: "translateY(4px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "slide-down":   { from: { transform: "translateY(-4px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "scale-in":     { from: { transform: "scale(0.97)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
        "shimmer":      { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "spin-slow":    { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
      },

      animation: {
        "fade-in":    "fade-in 200ms ease-out",
        "fade-out":   "fade-out 150ms ease-in",
        "slide-up":   "slide-up 200ms ease-out",
        "slide-down": "slide-down 200ms ease-out",
        "scale-in":   "scale-in 200ms ease-out",
        "shimmer":    "shimmer 2s ease-in-out infinite",
        "spin-slow":  "spin-slow 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

## CSS Custom Properties (globals.css)

```css
/* ============================================================
   AQARVISION — ZINC DESIGN SYSTEM
   Tech premium. Dense but breathable. Light + Dark.
   ============================================================ */

:root,
[data-theme="light"] {
  color-scheme: light;

  /* Backgrounds */
  --bg-app:       #FAFAFA;
  --bg-surface:   #FFFFFF;
  --bg-muted:     #F4F4F5;
  --bg-elevated:  #FFFFFF;
  --bg-overlay:   rgba(0, 0, 0, 0.5);

  /* Text */
  --text-primary:    #09090B;
  --text-secondary:  #71717A;
  --text-tertiary:   #A1A1AA;
  --text-inverse:    #FAFAFA;

  /* Borders */
  --border-default:  #E4E4E7;
  --border-strong:   #D4D4D8;
  --border-focus:    #F59E0B;

  /* Accent */
  --accent:          #F59E0B;
  --accent-hover:    #D97706;
  --accent-ghost:    rgba(245, 158, 11, 0.08);
  --accent-glow:     rgba(245, 158, 11, 0.15);

  /* Shadows */
  --shadow-color: rgba(0, 0, 0, 0.08);

  /* Typography */
  --font-display: "Geist", system-ui, sans-serif;
  --font-body:    "Geist", system-ui, sans-serif;
  --font-arabic:  "IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif;
  --font-mono:    "Geist Mono", "JetBrains Mono", monospace;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Sidebar */
  --sidebar-width: 240px;
  --sidebar-collapsed: 64px;
}

[data-theme="dark"] {
  color-scheme: dark;

  --bg-app:       #09090B;
  --bg-surface:   #18181B;
  --bg-muted:     #27272A;
  --bg-elevated:  #1F1F23;
  --bg-overlay:   rgba(0, 0, 0, 0.7);

  --text-primary:    #FAFAFA;
  --text-secondary:  #A1A1AA;
  --text-tertiary:   #71717A;
  --text-inverse:    #09090B;

  --border-default:  #27272A;
  --border-strong:   #3F3F46;
  --border-focus:    #FBBF24;

  --accent:          #FBBF24;
  --accent-hover:    #F59E0B;
  --accent-ghost:    rgba(251, 191, 36, 0.08);
  --accent-glow:     rgba(251, 191, 36, 0.12);

  --shadow-color: rgba(0, 0, 0, 0.4);
}

/* ── Base reset ─────────────────────────────────────────── */
* { box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body {
  font-family: var(--font-body);
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--bg-app);
}
html[dir="rtl"] body { font-family: var(--font-arabic); }

/* ── Focus ring ─────────────────────────────────────────── */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* ── Selection ──────────────────────────────────────────── */
::selection {
  background: var(--accent-ghost);
  color: var(--text-primary);
}

/* ── Scrollbar (Webkit) ─────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-tertiary); }
```

## Font Loading (Next.js)

```typescript
// app/layout.tsx
import localFont from "next/font/local";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

const geist = localFont({
  src: [
    { path: "./fonts/Geist-Regular.woff2", weight: "400" },
    { path: "./fonts/Geist-Medium.woff2", weight: "500" },
    { path: "./fonts/Geist-SemiBold.woff2", weight: "600" },
    { path: "./fonts/Geist-Bold.woff2", weight: "700" },
  ],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Regular.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});
```

## Dark Mode Implementation

```typescript
// lib/theme.ts
"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored ?? "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function applyTheme(t: Theme) {
    const resolved = t === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : t;
    document.documentElement.setAttribute("data-theme", resolved);
    // Set cookie for SSR hydration
    document.cookie = `theme=${resolved};path=/;max-age=31536000`;
  }

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return { theme, toggle, setTheme: (t: Theme) => { setTheme(t); localStorage.setItem("theme", t); applyTheme(t); } };
}
```

## Iconography

Use **Lucide React** exclusively. 20px default, 16px for inline/dense contexts. Stroke width 1.5px default, 2px for emphasis.

```tsx
import { Search, Home, Heart, Bell, Settings, ChevronRight } from "lucide-react";
<Search className="size-5 text-secondary" strokeWidth={1.5} />
```

## Responsive Breakpoints

```
sm:  640px   — Mobile landscape
md:  768px   — Tablet portrait
lg:  1024px  — Tablet landscape / small desktop
xl:  1280px  — Desktop
2xl: 1536px  — Wide desktop
```

Mobile-first: default styles = mobile, add `md:` / `lg:` for larger.

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Zinc neutral ramp ─────────────────────────────────────
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

        // ── Amber accent ──────────────────────────────────────────
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

        // ── Semantic aliases (CSS var–driven) ─────────────────────
        surface:           "var(--bg-surface)",
        "surface-muted":   "var(--bg-muted)",
        "surface-elevated":"var(--bg-elevated)",
        app:               "var(--bg-app)",
        overlay:           "var(--bg-overlay)",
        primary:           "var(--text-primary)",
        secondary:         "var(--text-secondary)",
        tertiary:          "var(--text-tertiary)",
        inverse:           "var(--text-inverse)",
        accent:            "var(--accent)",
        "accent-hover":    "var(--accent-hover)",
        "accent-ghost":    "var(--accent-ghost)",

        // ── Borders (CSS var–driven) ────────────────────────────
        "border-default":  "var(--border-default)",
        "border-strong":   "var(--border-strong)",
        "border-focus":    "var(--border-focus)",

        // ── Status ────────────────────────────────────────────────
        success: { DEFAULT: "#22C55E", ghost: "rgba(34,197,94,0.08)" },
        warning: { DEFAULT: "#F59E0B", ghost: "rgba(245,158,11,0.08)" },
        danger:  { DEFAULT: "#EF4444", ghost: "rgba(239,68,68,0.08)" },
        info:    { DEFAULT: "#3B82F6", ghost: "rgba(59,130,246,0.08)" },

        // ── Tricolore algérien (Atlas Pulse) ─────────────────────
        sahara:  { DEFAULT: "#E8920A", 50: "#FEF7E8", 100: "#FDECC5", 500: "#E8920A", 600: "#C67A08", 700: "#9D6106" },
        med:     { DEFAULT: "#1A7FA8", 50: "#E8F5FA", 100: "#C5E8F3", 500: "#1A7FA8", 600: "#156B8E", 700: "#105674" },
        atlas:   { DEFAULT: "#2A8A4A", 50: "#EAF5EE", 100: "#C8E6D2", 500: "#2A8A4A", 600: "#22733D", 700: "#1A5C30" },

        // ── Real estate specific ──────────────────────────────────
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
        sans:    ["Geist", "system-ui", "sans-serif"],
        body:    ["Geist", "system-ui", "sans-serif"],
        arabic:  ["IBM Plex Sans Arabic", "Noto Sans Arabic", "sans-serif"],
        mono:    ["Geist Mono", "JetBrains Mono", "monospace"],
      },

      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
        xs:    ["0.75rem",   { lineHeight: "1rem" }],
        sm:    ["0.8125rem", { lineHeight: "1.25rem" }],
        base:  ["0.875rem",  { lineHeight: "1.25rem" }],
        md:    ["1rem",      { lineHeight: "1.5rem" }],
        lg:    ["1.125rem",  { lineHeight: "1.75rem" }],
        xl:    ["1.25rem",   { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem",    { lineHeight: "2rem" }],
        "3xl": ["1.875rem",  { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem",   { lineHeight: "2.5rem" }],
        "5xl": ["3rem",      { lineHeight: "1" }],
      },

      maxWidth: {
        container: "1320px",
      },

      spacing: {
        "4.5": "1.125rem",
        "13":  "3.25rem",
        "15":  "3.75rem",
        "18":  "4.5rem",
        "88":  "22rem",
        "16s": "4rem",
      },

      borderRadius: {
        sm:      "4px",
        DEFAULT: "6px",
        md:      "6px",
        lg:      "8px",
        xl:      "12px",
        "2xl":   "16px",
      },

      boxShadow: {
        xs:           "0 1px 2px rgba(0,0,0,0.05)",
        sm:           "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        md:           "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
        lg:           "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)",
        xl:           "0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)",
        card:         "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "card-hover": "0 8px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)",
        elevated:     "var(--shadow-elevated)",
        ring:         "0 0 0 2px var(--accent)",
        "ring-offset":"0 0 0 2px var(--bg-surface), 0 0 0 4px var(--accent)",
      },

      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        spring:  "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      transitionDuration: {
        fast:   "100ms",
        normal: "200ms",
        slow:   "300ms",
        slower: "500ms",
      },

      keyframes: {
        "fade-in":    { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out":   { from: { opacity: "1" }, to: { opacity: "0" } },
        "slide-up":   { from: { transform: "translateY(4px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "slide-down": { from: { transform: "translateY(-4px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "scale-in":   { from: { transform: "scale(0.97)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
        "shimmer":    { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "shake":      { "0%, 100%": { transform: "translateX(0)" }, "20%, 60%": { transform: "translateX(-4px)" }, "40%, 80%": { transform: "translateX(4px)" } },
        "drawer-up":  { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
      },

      animation: {
        "fade-in":    "fade-in 200ms ease-out",
        "fade-out":   "fade-out 150ms ease-in",
        "slide-up":   "slide-up 200ms ease-out",
        "slide-down": "slide-down 200ms ease-out",
        "scale-in":   "scale-in 200ms ease-out",
        "shimmer":    "shimmer 2s ease-in-out infinite",
        "shake":      "shake 400ms ease-in-out",
        "drawer-up":  "drawer-up 300ms cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

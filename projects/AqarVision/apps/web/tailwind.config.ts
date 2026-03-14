import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy tokens (kept for compatibility)
        "blue-night": "#1a365d",
        gold: "#d4af37",
        "off-white": "#f7fafc",
        // ── Indigo Nuit design system ───────────────────────────
        aqar: {
          deep:    "#060B18",   // body background
          bg:      "#0A1222",   // page sections
          "bg-2":  "#0F1A2E",   // secondary sections
          "bg-3":  "#142240",   // tertiary / hover states
          card:    "#111D33",   // cards
          "card-hover": "#162545",
          surface: "#1A2D4A",   // chip backgrounds, small surfaces
          cyan:    "#00E5BF",   // primary accent
          "cyan-dim": "#00C4A3",
          amber:   "#F5A623",   // secondary accent
          red:     "#FF4757",   // error / danger
          text:    "#E8EDF5",   // primary text
          muted:   "#8B95A8",   // secondary text
          faint:   "#5A6478",   // tertiary text / labels
          border:  "#1E3050",
          "border-light": "#162540",
          "border-hover": "#2A4060",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Noto Sans Arabic", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        arabic: ["Noto Sans Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

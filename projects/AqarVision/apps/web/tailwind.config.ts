import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Legacy tokens (kept for compatibility) ───────────
        "blue-night": "#1a365d",
        gold: "#d4af37",
        "off-white": "#f7fafc",

        // ── Charbon & Corail design system ──────────────────
        coral: {
          DEFAULT: "#E8725C",
          hover:   "#D4624D",
          light:   "#F0998A",
        },
        charcoal: {
          950: "#1C1C1E",
          900: "#2C2C2E",
          800: "#3A3A3C",
          700: "#48484A",
          600: "#636366",
          500: "#8E8E93",
          400: "#AEAEB2",
          300: "#C7C7CC",
          200: "#D1D1D6",
          100: "#E5E5EA",
        },
        warm: {
          50:  "#FDFCFA",
          100: "#F5F0EB",
          200: "#EBE5DD",
          300: "#DDD5CA",
        },
        aqar: {
          // Semantic aliases for component usage
          page:    "#FDFCFA",
          surface: "#FFFFFF",
          sunken:  "#F5F0EB",
          coral:   "#E8725C",
          amber:   "#D4943A",
          red:     "#D14545",
          success: "#3B9B6D",
        },
      },
      fontFamily: {
        display: ["Libre Baskerville", "Georgia", "serif"],
        sans:    ["Figtree", "Noto Sans Arabic", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
        arabic:  ["Noto Sans Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

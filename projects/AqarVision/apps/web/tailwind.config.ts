import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Onyx & Ivoire — design system ────────────────────
        onyx: {
          DEFAULT: "#0D0D0D",
          light:   "#1A1917",
          mid:     "#2A2926",
          soft:    "#3D3B37",
        },
        ivoire: {
          DEFAULT: "#FDFBF7",
          warm:    "#F6F1EA",
          deep:    "#EBE5DB",
          border:  "#DDD7CC",
        },
        or: {
          DEFAULT: "#B8A88A",
          light:   "#D4C9B0",
          deep:    "#8B7A5E",
        },

        // ── Semantic text ────────────────────────────────────
        "text-dark":    "#0D0D0D",
        "text-body":    "#5C5347",
        "text-muted":   "#8A8279",
        "text-faint":   "#B0A89E",

        // ── Legacy aliases (homepage & other pages) ──────────
        "blue-night": "#0D0D0D",   // → onyx
        gold:         "#B8A88A",   // → or
        "off-white":  "#FDFBF7",   // → ivoire

        // ── Charcoal → mapped to Onyx & Ivoire ───────────────
        charcoal: {
          950: "#0D0D0D",  // onyx
          900: "#1A1917",  // onyx-light
          800: "#2A2926",  // onyx-mid
          700: "#3D3B37",  // onyx-soft
          600: "#5C5347",  // text-body
          500: "#8A8279",  // text-muted
          400: "#B0A89E",  // text-faint
          300: "#DDD7CC",  // ivoire-border
          200: "#EBE5DB",  // ivoire-deep
          100: "#DDD7CC",  // ivoire-border
        },
        warm: {
          50:  "#FDFBF7",  // ivoire
          100: "#F6F1EA",  // ivoire-warm
          200: "#EBE5DB",  // ivoire-deep
          300: "#DDD7CC",  // ivoire-border
        },

        // ── Coral → or/gold ──────────────────────────────────
        coral: {
          DEFAULT: "#B8A88A",
          hover:   "#8B7A5E",
          light:   "#D4C9B0",
        },

        // ── Status ───────────────────────────────────────────
        aqar: {
          page:    "#FDFBF7",
          surface: "#FFFFFF",
          sunken:  "#F6F1EA",
          coral:   "#B8A88A",
          amber:   "#C49A3A",
          red:     "#B84A3A",
          success: "#5A8F6E",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        sans:    ["DM Sans", "Noto Sans Arabic", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
        arabic:  ["Noto Sans Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

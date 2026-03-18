import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sahara: {
          50: "#FEF7E6",
          100: "#FDE9B8",
          DEFAULT: "#E8920A",
          500: "#E8920A",
          600: "#C77D08",
          700: "#A66806",
        },
        med: {
          50: "#E6F4FA",
          100: "#B8E0F0",
          DEFAULT: "#1A7FA8",
          500: "#1A7FA8",
          600: "#156B8E",
          700: "#105774",
        },
        atlas: {
          50: "#E8F5EC",
          100: "#BAE3C5",
          DEFAULT: "#2A8A4A",
          500: "#2A8A4A",
          600: "#23743E",
          700: "#1C5E32",
        },
        "listing-sale": "#3B82F6",
        "listing-rent": "#8B5CF6",
        "listing-vacation": "#F59E0B",
        "status-draft": "#78716C",
        "status-pending": "#F59E0B",
        "status-published": "#22C55E",
        "status-paused": "#A8A29E",
        "status-rejected": "#EF4444",
        "status-sold": "#3B82F6",
      },
      fontFamily: {
        display: ["var(--font-geist)", "system-ui", "sans-serif"],
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        arabic: [
          "var(--font-ibm-plex-arabic)",
          "Noto Sans Arabic",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": [
          "0.6875rem",
          { lineHeight: "1rem", letterSpacing: "0.01em" },
        ],
        xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0" }],
        base: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0" }],
        md: ["1rem", { lineHeight: "1.5rem", letterSpacing: "0" }],
        lg: [
          "1.125rem",
          { lineHeight: "1.75rem", letterSpacing: "-0.01em" },
        ],
        xl: ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.02em" }],
        "3xl": [
          "1.875rem",
          { lineHeight: "2.25rem", letterSpacing: "-0.02em" },
        ],
        "4xl": [
          "2.25rem",
          { lineHeight: "2.5rem", letterSpacing: "-0.03em" },
        ],
        "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "6xl": ["3.75rem", { lineHeight: "1", letterSpacing: "-0.04em" }],
      },
      spacing: {
        "4.5": "18px",
        "13": "52px",
        "15": "60px",
        "18": "72px",
        "88": "352px",
      },
      zIndex: {
        sticky: "10",
        dropdown: "20",
        overlay: "30",
        modal: "40",
        toast: "50",
        tooltip: "60",
        max: "9999",
      },
      boxShadow: {
        xs: "0 1px 2px var(--shadow-color)",
        sm: "0 1px 3px var(--shadow-color), 0 1px 2px var(--shadow-color)",
        md: "0 4px 6px var(--shadow-color), 0 2px 4px var(--shadow-color)",
        lg: "0 10px 15px var(--shadow-color-hover), 0 4px 6px var(--shadow-color)",
        xl: "0 20px 25px var(--shadow-color-hover), 0 8px 10px var(--shadow-color)",
        card: "0 1px 3px var(--shadow-color), 0 1px 2px var(--shadow-color)",
        "card-hover":
          "0 8px 25px var(--shadow-color-hover), 0 4px 10px var(--shadow-color)",
        ring: "0 0 0 2px var(--ring-color)",
        "ring-offset":
          "0 0 0 2px var(--ring-offset), 0 0 0 4px var(--ring-color)",
        "ring-danger":
          "0 0 0 2px var(--ring-offset), 0 0 0 4px var(--ring-danger)",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        fast: "100ms",
        normal: "200ms",
        slow: "300ms",
        slower: "500ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(-8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-4px)" },
          "40%, 80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "fade-out": "fade-out 150ms ease-in",
        "slide-up": "slide-up 200ms ease-out",
        "slide-down": "slide-down 200ms ease-out",
        "scale-in": "scale-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        shimmer: "shimmer 2s linear infinite",
        shake: "shake 400ms cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

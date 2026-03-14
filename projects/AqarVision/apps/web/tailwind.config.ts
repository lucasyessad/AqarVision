import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "blue-night": "#1a365d",
        gold: "#d4af37",
        "off-white": "#f7fafc",
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans Arabic", "sans-serif"],
        arabic: ["Noto Sans Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

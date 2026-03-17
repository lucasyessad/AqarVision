/**
 * ThemeProvider — Injects agency theme CSS custom properties.
 *
 * Wraps children in a <div> with CSS variables set from the agency's
 * color configuration. This eliminates the need for inline style={{}}
 * with hex fallbacks throughout individual theme components.
 *
 * Usage:
 *   <ThemeProvider primary="#0A0A0A" accent="#C8A45C" secondary="#1A1A1A">
 *     <ThemeRenderer ... />
 *   </ThemeProvider>
 */

interface ThemeProviderProps {
  primary: string;
  accent: string;
  secondary: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Derives readable text colors from a background hex color.
 * Returns "255,255,255" for dark backgrounds, "0,0,0" for light.
 */
function getContrastRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  // Relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "0,0,0" : "255,255,255";
}

/**
 * Converts hex to RGB triplet string (e.g. "#FF0000" → "255,0,0").
 * Useful for rgba() usage in CSS: `rgba(var(--agency-primary-rgb), 0.1)`.
 */
function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

export function ThemeProvider({
  primary,
  accent,
  secondary,
  className = "",
  children,
}: ThemeProviderProps) {
  const cssVars = {
    "--agency-primary": primary,
    "--agency-accent": accent,
    "--agency-secondary": secondary,
    "--agency-primary-rgb": hexToRgb(primary),
    "--agency-accent-rgb": hexToRgb(accent),
    "--agency-secondary-rgb": hexToRgb(secondary),
    "--agency-on-primary": `rgb(${getContrastRgb(primary)})`,
    "--agency-on-accent": `rgb(${getContrastRgb(accent)})`,
    "--agency-on-secondary": `rgb(${getContrastRgb(secondary)})`,
  } as React.CSSProperties;

  return (
    <div style={cssVars} className={className}>
      {children}
    </div>
  );
}

export type { ThemeProviderProps };

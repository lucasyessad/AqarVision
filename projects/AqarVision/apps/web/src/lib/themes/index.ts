/**
 * Theme utilities for AqarVision agency storefronts.
 *
 * - themeToCSSVars  → produces a CSS custom property string
 * - resolveThemeColors → merges agency overrides with manifest defaults
 * - getThemeById   → look up a manifest by ID
 * - getAllThemes   → return every registered manifest
 */

import { THEME_REGISTRY } from './registry'
import type { ThemeManifest } from './registry'

export type { ThemeManifest, ThemeSection } from './registry'

// ── Color resolution ───────────────────────────────────────────────────────

export interface AgencyColorOverrides {
  primary_color?: string | null
  accent_color?: string | null
  secondary_color?: string | null
}

export interface ResolvedColors {
  primary: string
  accent: string
  secondary: string
}

/**
 * Merge agency-specific color overrides with the theme's defaults.
 * Any null / undefined override falls back to the manifest default.
 */
export function resolveThemeColors(
  manifest: ThemeManifest,
  agency: AgencyColorOverrides
): ResolvedColors {
  return {
    primary: agency.primary_color ?? manifest.defaultColors.primary,
    accent: agency.accent_color ?? manifest.defaultColors.accent,
    secondary: agency.secondary_color ?? manifest.defaultColors.secondary,
  }
}

/**
 * Build a CSS custom-properties string from a manifest and optional overrides.
 *
 * @example
 * const css = themeToCSSVars(manifest, { primary: '#ff0000' })
 * // "--agency-primary: #ff0000; --agency-accent: #fbbf24; --agency-secondary: #6366f1;"
 */
export function themeToCSSVars(
  manifest: ThemeManifest,
  overrides?: Partial<ResolvedColors>
): string {
  const colors: ResolvedColors = {
    ...manifest.defaultColors,
    ...Object.fromEntries(
      Object.entries(overrides ?? {}).filter(([, v]) => v != null)
    ),
  }
  return (
    `--agency-primary: ${colors.primary}; ` +
    `--agency-accent: ${colors.accent}; ` +
    `--agency-secondary: ${colors.secondary};`
  )
}

// ── Registry accessors ────────────────────────────────────────────────────

/**
 * Look up a theme manifest by its ID.
 * Returns `undefined` if no manifest matches.
 */
export function getThemeById(id: string): ThemeManifest | undefined {
  return THEME_REGISTRY.find((t) => t.id === id)
}

/**
 * Return all registered theme manifests.
 */
export function getAllThemes(): ThemeManifest[] {
  return THEME_REGISTRY
}

/**
 * Resolve the manifest for the given theme ID, falling back to 'modern'
 * if the requested theme is not found or not gated correctly.
 * This is the preferred helper for Server Components.
 */
export function resolveManifest(themeId: string | null | undefined): ThemeManifest {
  const manifest = getThemeById(themeId ?? 'modern')
  // Graceful fallback: modern is always available (plan: null)
  return manifest ?? (getThemeById('modern') as ThemeManifest)
}

/**
 * Plan-gating utilities for AqarVision subscription plans.
 *
 * Plans (ascending order): starter → pro → enterprise
 *
 * These utilities are intentionally pure (no I/O) so they can be used in
 * both Server Components and client-side components without importing Supabase.
 *
 * For feature-flag resolution based on plan, use `@aqarvision/feature-flags`
 * (`getFlagsForPlan`). This module focuses on plan hierarchy and theme gating.
 */

// ── Plan hierarchy ────────────────────────────────────────────────────────────

/**
 * Numeric rank for each plan.
 * A higher number means a higher-tier plan.
 */
export const PLAN_HIERARCHY: Record<string, number> = {
  starter: 0,
  pro: 1,
  enterprise: 2,
} as const;

/** Union of all valid plan codes */
export type PlanCode = "starter" | "pro" | "enterprise";

// ── Plan comparison ───────────────────────────────────────────────────────────

/**
 * Returns `true` if `current` is at least as high as `required`.
 *
 * Unknown plan codes are treated as below starter (rank -1) to fail safely.
 *
 * @example
 * isPlanAtLeast("starter", "pro")     // true  — pro >= starter
 * isPlanAtLeast("enterprise", "pro")  // false — pro < enterprise
 * isPlanAtLeast("pro", "pro")         // true  — equal ranks pass
 */
export function isPlanAtLeast(required: string, current: string): boolean {
  const requiredLevel = PLAN_HIERARCHY[required] ?? -1;
  const currentLevel = PLAN_HIERARCHY[current] ?? -1;
  return currentLevel >= requiredLevel;
}

// ── Theme registry & gating ───────────────────────────────────────────────────

/**
 * Returns `true` if `themeId` is accessible on the given `plan`.
 *
 * The source of truth for plan requirements is THEME_REGISTRY (registry.ts).
 * Themes with `plan: null` are free for everyone.
 * Themes with `plan: "pro"` require Pro or higher.
 * Themes with `plan: "enterprise"` require Enterprise.
 * Unknown theme IDs return false (fail-safe).
 *
 * @example
 * isThemeAvailable("mediterranee", "pro")       // true
 * isThemeAvailable("luxe-noir", "pro")          // false — needs enterprise
 * isThemeAvailable("minimal", "starter")        // true  — no plan required
 * isThemeAvailable("unknown", "enterprise")     // false — not in registry
 */
export function isThemeAvailable(themeId: string, plan: string): boolean {
  // Inline the registry plan map to keep this module free of import cycles.
  // Keep in sync with src/lib/themes/registry.ts.
  const THEME_PLAN_MAP: Record<string, PlanCode | null> = {
    // Free (starter)
    minimal: null,
    "corporate-navy": null,
    "swiss-minimal": null,
    modern: null,
    // Pro
    mediterranee: "pro",
    "marocain-contemporain": "pro",
    "pastel-doux": "pro",
    "organique-eco": "pro",
    professional: "pro",
    // Enterprise
    "luxe-noir": "enterprise",
    "editorial-07": "enterprise",
    "art-deco": "enterprise",
    "neo-brutalist": "enterprise",
    luxury: "enterprise",
    bold: "enterprise",
  };

  if (!(themeId in THEME_PLAN_MAP)) {
    return false;
  }
  const required = THEME_PLAN_MAP[themeId];
  if (required == null) {
    return true;
  }
  return isPlanAtLeast(required, plan);
}

/**
 * Returns all theme IDs that are available for the given plan.
 *
 * @example
 * getAvailableThemes("starter")     // ["minimal", "corporate-navy", ...]
 * getAvailableThemes("enterprise")  // all themes
 */
export function getAvailableThemes(plan: string): string[] {
  // Import THEME_REGISTRY lazily to avoid top-level circular deps in tests.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { THEME_REGISTRY } = require("@/lib/themes/registry") as { THEME_REGISTRY: Array<{ id: string }> };
  return THEME_REGISTRY.map((t) => t.id).filter((id) => isThemeAvailable(id, plan));
}

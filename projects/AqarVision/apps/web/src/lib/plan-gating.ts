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
 * Map of all available themes and the minimum plan required to use them.
 *
 * - `null` means available to all plans (including free / no subscription).
 * - A plan code means that plan or higher is required.
 *
 * Add new themes here as they are introduced.
 */
export const THEME_PLAN_REQUIREMENTS: Record<string, PlanCode | null> = {
  // Available to everyone
  default: null,
  minimal: null,

  // Pro-tier themes
  modern: "pro",
  luxury: "pro",
  corporate: "pro",
  coastal: "pro",

  // Enterprise-tier themes
  premium: "enterprise",
  bespoke: "enterprise",
  flagship: "enterprise",
} as const;

/**
 * Returns `true` if `themeId` is accessible on the given `plan`.
 *
 * Unknown theme IDs are treated as unavailable (fail-safe).
 *
 * @example
 * isThemeAvailable("modern", "pro")        // true
 * isThemeAvailable("modern", "starter")    // false
 * isThemeAvailable("default", "starter")   // true  — no plan required
 * isThemeAvailable("unknown", "enterprise") // false — not in registry
 */
export function isThemeAvailable(themeId: string, plan: string): boolean {
  if (!(themeId in THEME_PLAN_REQUIREMENTS)) {
    return false;
  }
  const required = THEME_PLAN_REQUIREMENTS[themeId];
  if (required == null) {
    return true;
  }
  return isPlanAtLeast(required, plan);
}

/**
 * Returns all theme IDs that are available for the given plan.
 *
 * Themes are returned in insertion order of `THEME_PLAN_REQUIREMENTS`.
 *
 * @example
 * getAvailableThemes("starter")     // ["default", "minimal"]
 * getAvailableThemes("pro")         // ["default", "minimal", "modern", "luxury", ...]
 * getAvailableThemes("enterprise")  // all themes
 */
export function getAvailableThemes(plan: string): string[] {
  return Object.keys(THEME_PLAN_REQUIREMENTS).filter((themeId) =>
    isThemeAvailable(themeId, plan)
  );
}

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

import { THEME_REGISTRY } from "@/lib/themes/registry";

/** Derived once at module load — single source of truth from THEME_REGISTRY. */
const THEME_PLAN_MAP: ReadonlyMap<string, PlanCode | null> = new Map(
  THEME_REGISTRY.map((t) => [t.id, t.plan as PlanCode | null])
);

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
  if (!THEME_PLAN_MAP.has(themeId)) {
    return false;
  }
  const required = THEME_PLAN_MAP.get(themeId)!;
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
  return [...THEME_PLAN_MAP.keys()].filter((id) => isThemeAvailable(id, plan));
}

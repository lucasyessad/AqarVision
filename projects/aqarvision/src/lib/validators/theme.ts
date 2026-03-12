import { z } from 'zod';
import { ALL_THEME_IDS, isThemeAvailable, type ThemeId } from '@/lib/themes/registry';
import type { AgencyPlan } from '@/types/database';

/** Valid theme IDs including 'custom' */
export const themeIdSchema = z.enum([...ALL_THEME_IDS, 'custom'] as unknown as [string, ...string[]]);

/**
 * Validate that a theme is available for the given plan.
 * 'custom' is always allowed regardless of plan.
 */
export function validateThemeForPlan(themeId: string, plan: AgencyPlan): { valid: boolean; error?: string } {
  const parsed = themeIdSchema.safeParse(themeId);
  if (!parsed.success) {
    return { valid: false, error: `Thème inconnu : ${themeId}` };
  }

  if (themeId === 'custom') {
    return { valid: true };
  }

  if (!isThemeAvailable(themeId, plan)) {
    return {
      valid: false,
      error: `Le thème "${themeId}" nécessite un plan supérieur`,
    };
  }

  return { valid: true };
}

/** Zod schema that validates theme + plan together */
export const themeWithPlanSchema = z.object({
  theme: themeIdSchema,
  plan: z.enum(['starter', 'pro', 'enterprise']),
}).refine(
  (data) => data.theme === 'custom' || isThemeAvailable(data.theme, data.plan as AgencyPlan),
  { message: 'Ce thème n\'est pas disponible pour votre plan', path: ['theme'] }
);

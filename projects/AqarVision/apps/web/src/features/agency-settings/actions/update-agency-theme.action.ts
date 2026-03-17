"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isThemeAvailable } from "@/lib/plan-gating";
import {
  getAgencyForCurrentUser,
  isAuthError,
} from "@/lib/auth/get-agency-for-user";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import type { ActionResult } from "@/features/agencies/types/agency.types";

// ── Schema ────────────────────────────────────────────────────────────────────

const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide (ex: #1a365d)")
  .nullable()
  .optional();

const UpdateAgencyThemeSchema = z.object({
  theme: z.string().min(1, "Le thème est requis"),
  primary_color: HexColorSchema,
  accent_color: HexColorSchema,
  secondary_color: HexColorSchema,
});

export type UpdateAgencyThemeInput = z.infer<typeof UpdateAgencyThemeSchema>;

// ── Action ────────────────────────────────────────────────────────────────────

export async function updateAgencyThemeAction(
  _prevState: ActionResult<{ theme: string }> | null,
  formData: FormData
): Promise<ActionResult<{ theme: string }>> {
  // 1. Validate input
  const parsed = UpdateAgencyThemeSchema.safeParse({
    theme: formData.get("theme"),
    primary_color: formData.get("primary_color") || null,
    accent_color: formData.get("accent_color") || null,
    secondary_color: formData.get("secondary_color") || null,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  // 2. Resolve agency context to obtain agencyId and agencySlug
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) {
    return {
      success: false,
      error: { code: auth.code.toUpperCase(), message: auth.message },
    };
  }

  const agencyId = auth.agencyId;
  const agencySlug = auth.agencySlug;

  return withAgencyAuth(agencyId, "settings", "update", async () => {
    const supabase = await createClient();

    // 3. Fetch current plan from subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_id, plans(code)")
      .eq("agency_id", agencyId)
      .eq("status", "active")
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planCode: string = (subscription?.plans as any)?.code ?? "enterprise";

    // 4. Check plan gating
    if (!isThemeAvailable(parsed.data.theme, planCode)) {
      const err = new Error(`Le thème "${parsed.data.theme}" n'est pas disponible pour votre plan actuel.`);
      err.name = "PLAN_INSUFFICIENT";
      throw err;
    }

    // 5. Update agencies table
    const { error: updateError } = await supabase
      .from("agencies")
      .update({
        theme: parsed.data.theme,
        primary_color: parsed.data.primary_color ?? null,
        accent_color: parsed.data.accent_color ?? null,
        secondary_color: parsed.data.secondary_color ?? null,
      })
      .eq("id", agencyId);

    if (updateError) {
      const err = new Error(updateError.message);
      err.name = "DB_ERROR";
      throw err;
    }

    // 6. Revalidate appearance page + storefront
    revalidatePath("/AqarPro/dashboard/settings/appearance");
    revalidatePath(`/a/${agencySlug}`);

    return { theme: parsed.data.theme };
  });
}

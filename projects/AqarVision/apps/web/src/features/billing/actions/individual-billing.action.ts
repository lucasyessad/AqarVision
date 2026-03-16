"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  startPackCheckout,
  startIndividualSubscriptionCheckout,
  getEffectiveQuota,
} from "../services/individual-billing.service";
import type { IndividualCheckoutResult } from "../services/individual-billing.service";
import type { ActionResult } from "../types/billing.types";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const StartPackCheckoutSchema = z.object({
  pack_slug: z.enum(["pack_3", "pack_7", "pack_15"]),
});

const StartSubscriptionCheckoutSchema = z.object({
  plan_slug: z.enum(["chaab_plus", "chaab_pro"]),
});

// ---------------------------------------------------------------------------
// Pack checkout
// ---------------------------------------------------------------------------

export async function startPackCheckoutAction(
  _prev: ActionResult<IndividualCheckoutResult> | null,
  formData: FormData
): Promise<ActionResult<IndividualCheckoutResult>> {
  const parsed = StartPackCheckoutSchema.safeParse({
    pack_slug: formData.get("pack_slug"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0]!.message },
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Connexion requise" } };
  }

  try {
    const result = await startPackCheckout(supabase, user.id, parsed.data.pack_slug, user.email!);
    revalidatePath("/[locale]/AqarPro/dashboard/billing", "page");
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors du paiement";
    return { success: false, error: { code: "CHECKOUT_ERROR", message } };
  }
}

// ---------------------------------------------------------------------------
// Subscription checkout
// ---------------------------------------------------------------------------

export async function startIndividualSubscriptionAction(
  _prev: ActionResult<IndividualCheckoutResult> | null,
  formData: FormData
): Promise<ActionResult<IndividualCheckoutResult>> {
  const parsed = StartSubscriptionCheckoutSchema.safeParse({
    plan_slug: formData.get("plan_slug"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0]!.message },
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Connexion requise" } };
  }

  try {
    const result = await startIndividualSubscriptionCheckout(
      supabase,
      user.id,
      parsed.data.plan_slug,
      user.email!
    );
    revalidatePath("/[locale]/AqarPro/dashboard/billing", "page");
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors du paiement";
    return { success: false, error: { code: "CHECKOUT_ERROR", message } };
  }
}

// ---------------------------------------------------------------------------
// Get effective quota (server action for client-side revalidation)
// ---------------------------------------------------------------------------

export async function getEffectiveQuotaAction(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 2; // FREE_LISTING_QUOTA fallback
  return getEffectiveQuota(supabase, user.id);
}

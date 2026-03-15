"use server";

import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { StartCheckoutSchema, OpenPortalSchema } from "../schemas/billing.schema";
import { startCheckout, openBillingPortal } from "../services/billing.service";
import type { ActionResult } from "../types/billing.types";
import type { CheckoutResult, PortalResult } from "../types/billing.types";
import { createClient } from "@/lib/supabase/server";

export async function startCheckoutAction(
  _prevState: ActionResult<CheckoutResult> | null,
  formData: FormData
): Promise<ActionResult<CheckoutResult>> {
  const parsed = StartCheckoutSchema.safeParse({
    agency_id: formData.get("agency_id"),
    plan_code: formData.get("plan_code"),
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

  return withAgencyAuth(parsed.data.agency_id, "billing", "read", async (ctx) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return startCheckout(supabase, ctx.agencyId, parsed.data.plan_code, user!.email!);
  });
}

export async function openBillingPortalAction(
  _prevState: ActionResult<PortalResult> | null,
  formData: FormData
): Promise<ActionResult<PortalResult>> {
  const parsed = OpenPortalSchema.safeParse({
    agency_id: formData.get("agency_id"),
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

  return withAgencyAuth(parsed.data.agency_id, "billing", "read", async (ctx) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return openBillingPortal(supabase, ctx.agencyId, user!.email!);
  });
}

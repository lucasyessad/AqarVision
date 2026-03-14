"use server";

import { createClient } from "@/lib/supabase/server";
import { StartCheckoutSchema, OpenPortalSchema } from "../schemas/billing.schema";
import { startCheckout, openBillingPortal } from "../services/billing.service";
import type { ActionResult } from "../types/billing.types";
import type { CheckoutResult, PortalResult } from "../types/billing.types";

export async function startCheckoutAction(
  _prevState: ActionResult<CheckoutResult> | null,
  formData: FormData
): Promise<ActionResult<CheckoutResult>> {
  const raw = {
    agency_id: formData.get("agency_id"),
    plan_code: formData.get("plan_code"),
  };

  const parsed = StartCheckoutSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    };
  }

  // Check admin permission
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("role")
    .eq("agency_id", parsed.data.agency_id)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role as string)) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Admin access required" },
    };
  }

  try {
    const result = await startCheckout(
      supabase,
      parsed.data.agency_id,
      parsed.data.plan_code,
      user.email!
    );
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return {
      success: false,
      error: { code: "CHECKOUT_ERROR", message },
    };
  }
}

export async function openBillingPortalAction(
  _prevState: ActionResult<PortalResult> | null,
  formData: FormData
): Promise<ActionResult<PortalResult>> {
  const raw = {
    agency_id: formData.get("agency_id"),
  };

  const parsed = OpenPortalSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    };
  }

  // Check admin permission
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("role")
    .eq("agency_id", parsed.data.agency_id)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role as string)) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Admin access required" },
    };
  }

  try {
    const result = await openBillingPortal(
      supabase,
      parsed.data.agency_id,
      user.email!
    );
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portal error";
    return {
      success: false,
      error: { code: "PORTAL_ERROR", message },
    };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { withSuperAdminAuth } from "@/lib/auth/with-super-admin-auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import type { ModerationAction, VerificationAction } from "../types/admin.types";
import {
  moderationSchema,
  verificationReviewSchema,
  platformSettingSchema,
  entitlementSchema,
  paymentApprovalSchema,
} from "../schemas/admin.schema";
import {
  moderateListing,
  reviewVerification,
  updatePlatformSetting,
  approvePayment,
  setEntitlement,
} from "../services/admin.service";

export async function moderateListingAction(
  listingId: string,
  action: ModerationAction,
  reason?: string
): Promise<ActionResult<void>> {
  const parsed = moderationSchema.safeParse({ listing_id: listingId, action, reason });
  if (!parsed.success) {
    return { success: false, code: "VALIDATION_ERROR", message: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  return withSuperAdminAuth(async (ctx) => {
    const supabase = await createClient();
    await moderateListing(supabase, listingId, action, reason ?? null, ctx.userId);
    revalidatePath("/admin/moderation");
  });
}

export async function reviewVerificationAction(
  verificationId: string,
  action: VerificationAction,
  level?: number,
  reason?: string
): Promise<ActionResult<void>> {
  const parsed = verificationReviewSchema.safeParse({
    verification_id: verificationId,
    action,
    level,
    reason,
  });
  if (!parsed.success) {
    return { success: false, code: "VALIDATION_ERROR", message: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  return withSuperAdminAuth(async (ctx) => {
    const supabase = await createClient();
    await reviewVerification(supabase, verificationId, action, level, reason, ctx.userId);
    revalidatePath("/admin/verifications");
  });
}

export async function updatePlatformSettingAction(
  key: string,
  value: string
): Promise<ActionResult<void>> {
  const parsed = platformSettingSchema.safeParse({ key, value });
  if (!parsed.success) {
    return { success: false, code: "VALIDATION_ERROR", message: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  return withSuperAdminAuth(async () => {
    const supabase = await createClient();
    await updatePlatformSetting(supabase, key, value);
    revalidatePath("/admin/platform-settings");
  });
}

export async function approvePaymentAction(
  paymentId: string
): Promise<ActionResult<void>> {
  const parsed = paymentApprovalSchema.safeParse({ payment_id: paymentId });
  if (!parsed.success) {
    return { success: false, code: "VALIDATION_ERROR", message: "ID de paiement invalide" };
  }

  return withSuperAdminAuth(async (ctx) => {
    const supabase = await createClient();
    await approvePayment(supabase, paymentId, ctx.userId);
    revalidatePath("/admin/payments");
  });
}

export async function setEntitlementAction(
  agencyId: string,
  featureKey: string,
  enabled: boolean,
  metadata?: Record<string, unknown>
): Promise<ActionResult<void>> {
  const parsed = entitlementSchema.safeParse({
    agency_id: agencyId,
    feature_key: featureKey,
    enabled,
    metadata,
  });
  if (!parsed.success) {
    return { success: false, code: "VALIDATION_ERROR", message: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  return withSuperAdminAuth(async () => {
    const supabase = await createClient();
    await setEntitlement(supabase, agencyId, featureKey, enabled, metadata ?? {});
    revalidatePath("/admin/entitlements");
  });
}

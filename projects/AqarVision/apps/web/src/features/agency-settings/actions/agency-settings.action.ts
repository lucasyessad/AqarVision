"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import {
  brandingSchema,
  storefrontContentSchema,
  notificationPrefsSchema,
} from "../schemas/agency-settings.schema";
import {
  updateBranding,
  updateStorefrontContent,
  updateNotificationPrefs,
} from "../services/agency-settings.service";
import { updateTag } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";
import type { BrandingInput, StorefrontContentInput, NotificationPrefsInput } from "../schemas/agency-settings.schema";

export async function updateBrandingAction(
  agencyId: string,
  input: BrandingInput
): Promise<ActionResult<void>> {
  const parsed = brandingSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Données invalides");
  }

  return withAgencyAuth(agencyId, "settings", "update", async () => {
    const supabase = await createClient();
    await updateBranding(supabase, agencyId, parsed.data);
    updateTag(CacheTags.agency(agencyId));
  });
}

export async function updateStorefrontContentAction(
  agencyId: string,
  input: StorefrontContentInput
): Promise<ActionResult<void>> {
  const parsed = storefrontContentSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Données invalides");
  }

  return withAgencyAuth(agencyId, "settings", "update", async () => {
    const supabase = await createClient();
    await updateStorefrontContent(supabase, agencyId, parsed.data);
    updateTag(CacheTags.agency(agencyId));
  });
}

export async function updateNotificationPrefsAction(
  agencyId: string,
  input: NotificationPrefsInput
): Promise<ActionResult<void>> {
  const parsed = notificationPrefsSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Données invalides");
  }

  return withAgencyAuth(agencyId, "settings", "update", async () => {
    const supabase = await createClient();
    await updateNotificationPrefs(supabase, agencyId, parsed.data);
    updateTag(CacheTags.agency(agencyId));
  });
}

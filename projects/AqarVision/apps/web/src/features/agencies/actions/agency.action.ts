"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import {
  createAgencySchema,
  updateAgencySettingsSchema,
  type CreateAgencyInput,
  type UpdateAgencySettingsInput,
} from "@/features/agencies/schemas/agency.schema";
import {
  createAgency,
  checkSlugAvailability,
} from "@/features/agencies/services/agency.service";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { createLogger } from "@/lib/logger";

const log = createLogger("agency.action");

export async function createAgencyAction(
  input: CreateAgencyInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const parsed = createAgencySchema.safeParse(input);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return fail("VALIDATION_ERROR", firstError?.message ?? "Données invalides");
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return fail("UNAUTHORIZED", "Vous devez être connecté");
    }

    // Check slug availability
    const slugFree = await checkSlugAvailability(supabase, parsed.data.slug);
    if (!slugFree) {
      return fail("SLUG_TAKEN", "Ce slug est déjà utilisé");
    }

    const agency = await createAgency(supabase, parsed.data, user.id);

    log.info(
      { agencyId: agency.id, userId: user.id },
      "Agency created"
    );

    revalidatePath("/AqarPro/dashboard");

    return ok({ id: agency.id, slug: agency.slug });
  } catch (error) {
    log.error({ error }, "Failed to create agency");
    const message =
      error instanceof Error ? error.message : "Erreur lors de la création";
    return fail("INTERNAL_ERROR", message);
  }
}

export async function updateAgencySettingsAction(
  agencyId: string,
  input: UpdateAgencySettingsInput
): Promise<ActionResult<void>> {
  return withAgencyAuth(agencyId, "settings", "update", async (ctx) => {
    const parsed = updateAgencySettingsSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("agencies")
      .update({
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        email: parsed.data.email,
        phone: parsed.data.phone,
        whatsapp_phone: parsed.data.whatsapp_phone || null,
        opening_hours: parsed.data.opening_hours ?? null,
        facebook_url: parsed.data.facebook_url || null,
        instagram_url: parsed.data.instagram_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agencyId);

    if (error) throw error;

    log.info({ agencyId, userId: ctx.userId }, "Agency settings updated");

    revalidatePath("/AqarPro/dashboard/settings");
  });
}

export async function checkSlugAction(
  slug: string
): Promise<ActionResult<{ available: boolean }>> {
  try {
    if (!slug || slug.length < 3) {
      return ok({ available: false });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return ok({ available: false });
    }

    const supabase = await createClient();
    const available = await checkSlugAvailability(supabase, slug);

    return ok({ available });
  } catch (error) {
    log.error({ error, slug }, "Failed to check slug");
    return fail("INTERNAL_ERROR", "Erreur de vérification");
  }
}

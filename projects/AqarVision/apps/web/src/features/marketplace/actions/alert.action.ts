"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { createAlertSchema, type CreateAlertInput } from "../schemas/search.schema";
import { updateTag } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";

export async function createAlertAction(
  input: CreateAlertInput
): Promise<ActionResult<{ alertId: string }>> {
  const parsed = createAlertSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      parsed.error.errors[0]?.message ?? "Données invalides"
    );
  }

  const user = await getCachedUser();
  if (!user) {
    return fail("UNAUTHORIZED", "Vous devez être connecté pour créer une alerte");
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("search_alerts")
      .insert({
        user_id: user.id,
        name: parsed.data.name,
        frequency: parsed.data.frequency,
        filters: parsed.data.filters,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) throw error;

    updateTag(CacheTags.alerts(user.id));
    return ok({ alertId: data.id });
  } catch {
    return fail("INTERNAL_ERROR", "Erreur lors de la création de l'alerte");
  }
}

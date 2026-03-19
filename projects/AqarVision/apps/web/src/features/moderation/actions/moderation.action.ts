"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { withSuperAdminAuth } from "@/lib/auth/with-super-admin-auth";
import { moderationActionSchema } from "../schemas/moderation.schema";
import { moderateListing } from "../services/moderation.service";
import { revalidatePath } from "next/cache";
import type { ModerationActionInput } from "../schemas/moderation.schema";

export async function moderateListingAction(
  input: ModerationActionInput
): Promise<ActionResult<void>> {
  const parsed = moderationActionSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Données invalides");
  }

  return withSuperAdminAuth(async (ctx) => {
    const supabase = await createClient();
    await moderateListing(
      supabase,
      parsed.data.listingId,
      parsed.data.action,
      parsed.data.reason ?? null,
      ctx.userId
    );
    revalidatePath("/admin/moderation");
  });
}

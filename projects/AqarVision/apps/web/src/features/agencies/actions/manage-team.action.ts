"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { ChangeMemberRoleSchema } from "../schemas/agency.schema";
import { changeMemberRole, deactivateMember } from "../services/agency.service";
import type { ActionResult } from "../types/agency.types";

export async function changeMemberRoleAction(
  _prevState: ActionResult<{ updated: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ updated: boolean }>> {
  const parsed = ChangeMemberRoleSchema.safeParse({
    agency_id: formData.get("agency_id"),
    user_id: formData.get("user_id"),
    new_role: formData.get("new_role"),
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

  return withAgencyAuth(parsed.data.agency_id, "team_member", "update", async () => {
    const supabase = await createClient();
    await changeMemberRole(
      supabase,
      parsed.data.agency_id,
      parsed.data.user_id,
      parsed.data.new_role
    );
    revalidatePath("/[locale]/agences", "page");
    return { updated: true };
  });
}

export async function deactivateMemberAction(
  _prevState: ActionResult<{ deactivated: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ deactivated: boolean }>> {
  const agencyId = formData.get("agency_id") as string;
  const targetUserId = formData.get("user_id") as string;

  if (!agencyId || !targetUserId) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Missing agency_id or user_id" },
    };
  }

  return withAgencyAuth(agencyId, "team_member", "update", async () => {
    const supabase = await createClient();
    await deactivateMember(supabase, agencyId, targetUserId);
    revalidatePath("/[locale]/agences", "page");
    return { deactivated: true };
  });
}

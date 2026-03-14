"use server";

import { createClient } from "@/lib/supabase/server";
import { UpdateAgencySchema } from "../schemas/agency.schema";
import { updateAgency, getUserMembership } from "../services/agency.service";
import type { ActionResult, AgencyDto } from "../types/agency.types";

const SETTINGS_UPDATE_ROLES = ["owner", "admin"] as const;

export async function updateAgencyAction(
  _prevState: ActionResult<AgencyDto> | null,
  formData: FormData
): Promise<ActionResult<AgencyDto>> {
  const parsed = UpdateAgencySchema.safeParse({
    agency_id: formData.get("agency_id"),
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
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

  const membership = await getUserMembership(supabase, parsed.data.agency_id, user.id);

  if (!membership || !SETTINGS_UPDATE_ROLES.includes(membership.role as "owner" | "admin")) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Insufficient permissions to update agency settings" },
    };
  }

  try {
    const { agency_id, ...updateData } = parsed.data;
    const agency = await updateAgency(supabase, agency_id, updateData);
    return { success: true, data: agency };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "UPDATE_FAILED",
        message: err instanceof Error ? err.message : "Failed to update agency",
      },
    };
  }
}

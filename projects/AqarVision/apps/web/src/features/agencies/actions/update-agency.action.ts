"use server";

import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { UpdateAgencySchema } from "../schemas/agency.schema";
import { updateAgency } from "../services/agency.service";
import type { ActionResult, AgencyDto } from "../types/agency.types";

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

  return withAgencyAuth(parsed.data.agency_id, "settings", "update", async () => {
    const supabase = await createClient();
    const { agency_id, ...updateData } = parsed.data;
    return updateAgency(supabase, agency_id, updateData);
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { CreateBranchSchema } from "../schemas/agency.schema";
import { createBranch } from "../services/agency.service";
import type { ActionResult, BranchDto } from "../types/agency.types";

export async function createBranchAction(
  _prevState: ActionResult<BranchDto> | null,
  formData: FormData
): Promise<ActionResult<BranchDto>> {
  const parsed = CreateBranchSchema.safeParse({
    agency_id: formData.get("agency_id"),
    name: formData.get("name"),
    wilaya_code: formData.get("wilaya_code"),
    commune_id: formData.get("commune_id")
      ? Number(formData.get("commune_id"))
      : undefined,
    address_text: formData.get("address_text") || undefined,
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
    const result = await createBranch(supabase, parsed.data);
    revalidatePath("/[locale]/agences", "page");
    return result;
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CreateAgencySchema } from "../schemas/agency.schema";
import { createAgency } from "../services/agency.service";
import type { ActionResult, AgencyDto } from "../types/agency.types";

export async function createAgencyAction(
  _prevState: ActionResult<AgencyDto> | null,
  formData: FormData
): Promise<ActionResult<AgencyDto>> {
  const parsed = CreateAgencySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
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

  try {
    const agency = await createAgency(supabase, parsed.data);
    revalidatePath("/[locale]/agences", "page");
    return { success: true, data: agency };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "CREATE_FAILED",
        message: err instanceof Error ? err.message : "Failed to create agency",
      },
    };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/features/agencies/types/agency.types";

// ── Schema ────────────────────────────────────────────────────────────────────

const SuspendAgencySchema = z.object({
  agencyId: z.string().uuid("ID agence invalide"),
});

export interface SuspendAgencyDto {
  agencyId: string;
  suspended_at: string;
}

// ── Action ────────────────────────────────────────────────────────────────────

export async function suspendAgencyAction(
  agencyId: string
): Promise<ActionResult<SuspendAgencyDto>> {
  // 1. Validate input
  const parsed = SuspendAgencySchema.safeParse({ agencyId });
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

  // 2. Verify caller is super_admin
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "Session invalide. Veuillez vous reconnecter." },
    };
  }

  const { data: isSuperAdmin, error: rpcError } = await supabase.rpc("is_super_admin", {
    p_user_id: user.id,
  });

  if (rpcError || !isSuperAdmin) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Accès réservé aux super administrateurs." },
    };
  }

  // 3. Soft-delete (suspend) the agency
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("agencies")
    .update({ deleted_at: now })
    .eq("id", parsed.data.agencyId);

  if (updateError) {
    return {
      success: false,
      error: { code: "DB_ERROR", message: updateError.message },
    };
  }

  revalidatePath("/admin/agencies");

  return {
    success: true,
    data: {
      agencyId: parsed.data.agencyId,
      suspended_at: now,
    },
  };
}

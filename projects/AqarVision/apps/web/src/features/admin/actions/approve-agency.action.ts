"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/features/agencies/types/agency.types";

// ── Schema ────────────────────────────────────────────────────────────────────

const ApproveAgencySchema = z.object({
  agencyId: z.string().uuid("ID agence invalide"),
});

export interface ApproveAgencyDto {
  agencyId: string;
  verification_status: "verified";
  is_verified: true;
}

// ── Action ────────────────────────────────────────────────────────────────────

export async function approveAgencyAction(
  agencyId: string
): Promise<ActionResult<ApproveAgencyDto>> {
  // 1. Validate input
  const parsed = ApproveAgencySchema.safeParse({ agencyId });
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

  // 3. Apply verification
  const { error: updateError } = await supabase
    .from("agencies")
    .update({
      is_verified: true,
      verification_status: "verified",
    })
    .eq("id", parsed.data.agencyId);

  if (updateError) {
    return {
      success: false,
      error: { code: "DB_ERROR", message: updateError.message },
    };
  }

  revalidatePath("/admin/agencies");
  revalidatePath("/admin/verifications");

  return {
    success: true,
    data: {
      agencyId: parsed.data.agencyId,
      verification_status: "verified",
      is_verified: true,
    },
  };
}

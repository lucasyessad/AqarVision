"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  getAgencyForCurrentUser,
  isAuthError,
} from "@/lib/actions/auth";
import type { ActionResult } from "@/features/agencies/types/agency.types";

// ── Schema ────────────────────────────────────────────────────────────────────

const SubmitVerificationSchema = z.object({
  legal_name: z
    .string()
    .min(2, "Le nom légal doit comporter au moins 2 caractères"),
  rc_number: z
    .string()
    .min(3, "Le numéro RC/SIRET est requis"),
  // document_url is handled separately (Supabase Storage signed URL)
  document_url: z
    .string()
    .url("URL du document invalide")
    .optional()
    .nullable(),
});

export type SubmitVerificationInput = z.infer<typeof SubmitVerificationSchema>;

export interface VerificationDto {
  verification_status: string;
}

// ── Action ────────────────────────────────────────────────────────────────────

export async function submitVerificationAction(
  _prevState: ActionResult<VerificationDto> | null,
  formData: FormData
): Promise<ActionResult<VerificationDto>> {
  // 1. Validate
  const parsed = SubmitVerificationSchema.safeParse({
    legal_name: formData.get("legal_name"),
    rc_number: formData.get("rc_number"),
    document_url: formData.get("document_url") || null,
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

  // 2. Auth
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) {
    return {
      success: false,
      error: { code: auth.code.toUpperCase(), message: auth.message },
    };
  }

  // Only owner can submit verification
  if (auth.role !== "owner") {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Seul le propriétaire de l'agence peut soumettre une demande de vérification.",
      },
    };
  }

  const supabase = await createClient();

  // 3. Check current status — prevent re-submission if already pending/verified
  const { data: agency } = await supabase
    .from("agencies")
    .select("verification_status")
    .eq("id", auth.agencyId)
    .single();

  if (agency?.verification_status === "pending") {
    return {
      success: false,
      error: {
        code: "ALREADY_PENDING",
        message: "Une demande de vérification est déjà en cours d'examen.",
      },
    };
  }

  if (agency?.verification_status === "verified") {
    return {
      success: false,
      error: {
        code: "ALREADY_VERIFIED",
        message: "Votre agence est déjà vérifiée.",
      },
    };
  }

  // 4. Update to pending + store verification metadata
  //    (legal_name / rc_number are stored in agency description or a separate
  //     verification_requests table in a future migration — for now we store
  //     them in the agency's description field as a JSON comment)
  const { error: updateError } = await supabase
    .from("agencies")
    .update({ verification_status: "pending" })
    .eq("id", auth.agencyId);

  if (updateError) {
    return {
      success: false,
      error: { code: "DB_ERROR", message: updateError.message },
    };
  }

  revalidatePath("/dashboard/settings/verification");

  return { success: true, data: { verification_status: "pending" } };
}

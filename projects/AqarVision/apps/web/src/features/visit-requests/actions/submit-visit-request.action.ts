"use server";

import { createClient } from "@/lib/supabase/server";
import { SubmitVisitRequestSchema } from "../schemas/visit-requests.schema";
import { submitVisitRequest } from "../services/visit-requests.service";
import type { ActionResult } from "../types/visit-requests.types";

interface SubmitResult {
  visit_request_id: string;
  lead_id: string | null;
}

export async function submitVisitRequestAction(
  input: unknown
): Promise<ActionResult<SubmitResult>> {
  // 1. Validate input
  const parsed = SubmitVisitRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  // 2. Call domain service (anonymous allowed)
  const supabase = await createClient();

  try {
    const result = await submitVisitRequest(supabase, {
      listingId: parsed.data.listingId,
      agencyId: parsed.data.agencyId,
      visitorName: parsed.data.visitorName,
      visitorPhone: parsed.data.visitorPhone,
      visitorEmail: parsed.data.visitorEmail || undefined,
      message: parsed.data.message,
      requestedDate: parsed.data.requestedDate,
    });

    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "SUBMIT_FAILED",
        message:
          err instanceof Error
            ? err.message
            : "Failed to submit visit request",
      },
    };
  }
}

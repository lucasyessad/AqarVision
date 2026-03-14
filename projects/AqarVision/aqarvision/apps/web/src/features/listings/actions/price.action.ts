"use server";

import { createClient } from "@/lib/supabase/server";
import { ChangePriceSchema } from "../schemas/listing.schema";
import { changePrice } from "../services/listing.service";

type PriceResult =
  | { success: true; data: { updated: true } }
  | { success: false; error: { code: string; message: string } };

export async function changePriceAction(
  _prevState: PriceResult | null,
  formData: FormData
): Promise<PriceResult> {
  const parsed = ChangePriceSchema.safeParse({
    listing_id: formData.get("listing_id"),
    new_price: Number(formData.get("new_price")),
    expected_version: Number(formData.get("expected_version")),
    reason: formData.get("reason") || undefined,
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
    await changePrice(
      supabase,
      user.id,
      parsed.data.listing_id,
      parsed.data.new_price,
      parsed.data.expected_version,
      parsed.data.reason
    );
    return { success: true, data: { updated: true } };
  } catch (err) {
    if (err instanceof Error && err.name === "OPTIMISTIC_LOCK_CONFLICT") {
      return {
        success: false,
        error: {
          code: "OPTIMISTIC_LOCK_CONFLICT",
          message: err.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: "PRICE_CHANGE_FAILED",
        message: err instanceof Error ? err.message : "Failed to change price",
      },
    };
  }
}

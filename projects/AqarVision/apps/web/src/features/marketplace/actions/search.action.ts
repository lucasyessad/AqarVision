"use server";

import { createClient } from "@/lib/supabase/server";
import { SearchFiltersSchema } from "../schemas/search.schema";
import { searchListings } from "../services/search.service";
import type { SearchResponse, ActionResult } from "../types/search.types";

export async function searchListingsAction(
  filters: Record<string, unknown>
): Promise<ActionResult<SearchResponse>> {
  const parsed = SearchFiltersSchema.safeParse(filters);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  try {
    const supabase = await createClient();
    const result = await searchListings(supabase, parsed.data);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "SEARCH_FAILED",
        message: err instanceof Error ? err.message : "Search failed",
      },
    };
  }
}

export async function recordViewAction(
  listingId: string
): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("listing_views").insert({
      listing_id: listingId,
      viewer_id: user?.id ?? null,
    });

    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "VIEW_RECORD_FAILED",
        message: err instanceof Error ? err.message : "Failed to record view",
      },
    };
  }
}

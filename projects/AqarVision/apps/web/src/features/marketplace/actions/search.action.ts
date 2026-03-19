"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { searchFiltersSchema, type SearchFilters } from "../schemas/search.schema";
import { searchListings, type SearchResult } from "../services/search.service";

export async function searchAction(
  rawFilters: SearchFilters,
  locale: string = "fr"
): Promise<ActionResult<SearchResult>> {
  const parsed = searchFiltersSchema.safeParse(rawFilters);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      parsed.error.errors[0]?.message ?? "Filtres invalides"
    );
  }

  try {
    const supabase = await createClient();
    const result = await searchListings(supabase, parsed.data, locale);
    return ok(result);
  } catch {
    return fail("INTERNAL_ERROR", "Erreur lors de la recherche");
  }
}

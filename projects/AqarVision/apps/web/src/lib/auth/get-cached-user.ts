import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Request-level cached auth.getUser().
 * Deduplicates multiple getUser() calls within the same request
 * (middleware, layout, page, header wrapper all call getUser()).
 *
 * React cache() scopes to the current request in RSC.
 */
export const getCachedUser = cache(async (supabase: SupabaseClient) => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
});

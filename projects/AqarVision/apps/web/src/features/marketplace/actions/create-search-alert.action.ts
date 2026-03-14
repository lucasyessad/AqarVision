"use server";

// NOTE: The `saved_searches` table (migration 00040) has columns:
//   id, user_id, name, filters jsonb, notify boolean, created_at, updated_at
//
// The `frequency` field is stored inside the `filters` jsonb object as
// `filters.frequency` since the table has no dedicated column for it.
// If you want a dedicated column, add a migration:
//   ALTER TABLE public.saved_searches ADD COLUMN frequency text NOT NULL DEFAULT 'daily'
//     CHECK (frequency IN ('immediate', 'daily', 'weekly'));

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "../types/search.types";

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, unknown>;
  notify: boolean;
  created_at: string;
  updated_at: string;
}

const CreateSearchAlertSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  filters: z.record(z.unknown()),
  frequency: z.enum(["immediate", "daily", "weekly"]).default("daily"),
});

export type CreateSearchAlertInput = z.infer<typeof CreateSearchAlertSchema>;

export async function createSearchAlertAction(
  input: CreateSearchAlertInput
): Promise<ActionResult<SavedSearch>> {
  // 1. Validate input
  const parsed = CreateSearchAlertSchema.safeParse(input);
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

  // 2. Resolve current actor
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Vous devez être connecté pour créer une alerte.",
      },
    };
  }

  // 3. Check for duplicate alerts (same user + same name)
  const { data: existing } = await supabase
    .from("saved_searches")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", parsed.data.name)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: {
        code: "DUPLICATE_ALERT",
        message: "Une alerte avec ce nom existe déjà.",
      },
    };
  }

  // 4. Store frequency inside filters jsonb (no dedicated column in current schema)
  const filtersWithFrequency: Record<string, unknown> = {
    ...parsed.data.filters,
    frequency: parsed.data.frequency,
  };

  // 5. Insert
  const { data, error } = await supabase
    .from("saved_searches")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      filters: filtersWithFrequency,
      notify: true,
    })
    .select("id, user_id, name, filters, notify, created_at, updated_at")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: {
        code: "INSERT_FAILED",
        message: error?.message ?? "Impossible de créer l'alerte.",
      },
    };
  }

  return {
    success: true,
    data: {
      id: data.id as string,
      user_id: data.user_id as string,
      name: data.name as string,
      filters: (data.filters as Record<string, unknown>) ?? {},
      notify: data.notify as boolean,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
    },
  };
}

export async function deleteSearchAlertAction(
  alertId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Non authentifié." },
    };
  }

  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", alertId)
    .eq("user_id", user.id); // RLS: user can only delete their own

  if (error) {
    return {
      success: false,
      error: { code: "DELETE_FAILED", message: error.message },
    };
  }

  return { success: true, data: null };
}

export async function toggleSearchAlertNotifyAction(
  alertId: string,
  notify: boolean
): Promise<ActionResult<null>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Non authentifié." },
    };
  }

  const { error } = await supabase
    .from("saved_searches")
    .update({ notify, updated_at: new Date().toISOString() })
    .eq("id", alertId)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      error: { code: "UPDATE_FAILED", message: error.message },
    };
  }

  return { success: true, data: null };
}

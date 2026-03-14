"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ToggleFavoriteSchema,
  SaveNoteSchema,
  SaveSearchSchema,
  DeleteSavedSearchSchema,
} from "../schemas/favorites.schema";
import {
  toggleFavorite,
  saveNote,
  saveSearch,
  deleteSavedSearch,
} from "../services/favorites.service";
import type { ActionResult } from "../types/favorites.types";

export async function toggleFavoriteAction(
  _prevState: ActionResult<{ favorited: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ favorited: boolean }>> {
  const raw = {
    listing_id: formData.get("listing_id"),
  };

  const parsed = ToggleFavoriteSchema.safeParse(raw);

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
    const result = await toggleFavorite(
      supabase,
      user.id,
      parsed.data.listing_id
    );
    revalidatePath("/[locale]/favorites", "page");
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "TOGGLE_FAVORITE_FAILED",
        message:
          err instanceof Error ? err.message : "Failed to toggle favorite",
      },
    };
  }
}

export async function saveNoteAction(
  _prevState: ActionResult<{ note_id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ note_id: string }>> {
  const raw = {
    listing_id: formData.get("listing_id"),
    body: formData.get("body"),
  };

  const parsed = SaveNoteSchema.safeParse(raw);

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
    const result = await saveNote(
      supabase,
      user.id,
      parsed.data.listing_id,
      parsed.data.body
    );
    revalidatePath("/[locale]/favorites", "page");
    return { success: true, data: { note_id: result.id } };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "SAVE_NOTE_FAILED",
        message: err instanceof Error ? err.message : "Failed to save note",
      },
    };
  }
}

export async function saveSearchAction(
  _prevState: ActionResult<{ search_id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ search_id: string }>> {
  const raw = {
    name: formData.get("name"),
    filters: JSON.parse((formData.get("filters") as string) || "{}"),
  };

  const parsed = SaveSearchSchema.safeParse(raw);

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
    const result = await saveSearch(
      supabase,
      user.id,
      parsed.data.name,
      parsed.data.filters
    );
    revalidatePath("/[locale]/favorites", "page");
    return { success: true, data: { search_id: result.id } };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "SAVE_SEARCH_FAILED",
        message: err instanceof Error ? err.message : "Failed to save search",
      },
    };
  }
}

export async function deleteSavedSearchAction(
  _prevState: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const raw = {
    id: formData.get("id"),
  };

  const parsed = DeleteSavedSearchSchema.safeParse(raw);

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
    await deleteSavedSearch(supabase, user.id, parsed.data.id);
    revalidatePath("/[locale]/favorites", "page");
    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "DELETE_SEARCH_FAILED",
        message:
          err instanceof Error ? err.message : "Failed to delete saved search",
      },
    };
  }
}

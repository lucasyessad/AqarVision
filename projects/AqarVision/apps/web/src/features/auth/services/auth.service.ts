import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileDto } from "../types/auth.types";
import type { UpdateProfileInput } from "../schemas/auth.schema";

export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileDto | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "user_id, full_name, avatar_url, phone, role, preferred_locale, created_at, updated_at"
    )
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    user_id: data.user_id,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    phone: data.phone,
    role: data.role,
    preferred_locale: data.preferred_locale,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } satisfies ProfileDto;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateProfileInput
): Promise<ProfileDto | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("user_id", userId)
    .select(
      "user_id, full_name, avatar_url, phone, role, preferred_locale, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    return null;
  }

  return {
    user_id: data.user_id,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    phone: data.phone,
    role: data.role,
    preferred_locale: data.preferred_locale,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } satisfies ProfileDto;
}

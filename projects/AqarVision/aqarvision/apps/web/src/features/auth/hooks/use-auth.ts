"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ProfileDto } from "../types/auth.types";
import { signOutAction } from "../actions/auth.action";

interface UseAuthReturn {
  user: User | null;
  profile: ProfileDto | null;
  loading: boolean;
  signOut: (locale?: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select(
          "user_id, full_name, avatar_url, phone, role, preferred_locale, created_at, updated_at"
        )
        .eq("user_id", userId)
        .single();

      if (data) {
        setProfile({
          user_id: data.user_id,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          phone: data.phone,
          role: data.role,
          preferred_locale: data.preferred_locale,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    }

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        fetchProfile(sessionUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await signOutAction();
  }, []);

  return { user, profile, loading, signOut };
}

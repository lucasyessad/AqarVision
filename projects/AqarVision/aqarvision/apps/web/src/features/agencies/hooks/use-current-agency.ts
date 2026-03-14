"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AgencyDto } from "../types/agency.types";

const AGENCY_STORAGE_KEY = "aqarvision_current_agency_id";

const AGENCY_SELECT =
  "id, name, slug, description, logo_url, cover_url, phone, email, is_verified, created_at";

interface UseCurrentAgencyReturn {
  agency: AgencyDto | null;
  agencies: AgencyDto[];
  setCurrentAgency: (agencyId: string) => void;
  loading: boolean;
}

export function useCurrentAgency(): UseCurrentAgencyReturn {
  const [agency, setAgency] = useState<AgencyDto | null>(null);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const supabase = createClient();

  const agencyIdFromUrl = params?.agency_id as string | undefined;

  useEffect(() => {
    async function load() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: memberships } = await supabase
        .from("agency_memberships")
        .select("agency_id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (!memberships || memberships.length === 0) {
        setLoading(false);
        return;
      }

      const agencyIds = memberships.map((m) => m.agency_id);

      const { data: agencyRows } = await supabase
        .from("agencies")
        .select(AGENCY_SELECT)
        .in("id", agencyIds);

      if (!agencyRows || agencyRows.length === 0) {
        setLoading(false);
        return;
      }

      const mapped: AgencyDto[] = agencyRows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description ?? null,
        logo_url: row.logo_url ?? null,
        cover_url: row.cover_url ?? null,
        phone: row.phone ?? null,
        email: row.email ?? null,
        is_verified: row.is_verified ?? false,
        created_at: row.created_at,
      }));

      setAgencies(mapped);

      const storedId =
        typeof window !== "undefined"
          ? localStorage.getItem(AGENCY_STORAGE_KEY)
          : null;

      const targetId = agencyIdFromUrl ?? storedId;
      const current = mapped.find((a) => a.id === targetId) ?? mapped[0];

      if (current) {
        setAgency(current);
        if (typeof window !== "undefined") {
          localStorage.setItem(AGENCY_STORAGE_KEY, current.id);
        }
      }

      setLoading(false);
    }

    load();
  }, [supabase, agencyIdFromUrl]);

  const setCurrentAgency = useCallback(
    (agencyId: string) => {
      const found = agencies.find((a) => a.id === agencyId);
      if (found) {
        setAgency(found);
        if (typeof window !== "undefined") {
          localStorage.setItem(AGENCY_STORAGE_KEY, agencyId);
        }
      }
    },
    [agencies]
  );

  return { agency, agencies, setCurrentAgency, loading };
}

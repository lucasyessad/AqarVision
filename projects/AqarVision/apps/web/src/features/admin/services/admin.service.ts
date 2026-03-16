import { createClient } from "@/lib/supabase/server";

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface GlobalStats {
  totalUsers: number;
  totalAgencies: number;
  totalListings: number;
  totalLeads: number;
}

export interface AgencyRow {
  id: string;
  name: string;
  slug: string;
  plan: string | null;
  is_verified: boolean;
  verification_status: string;
  created_at: string;
  deleted_at: string | null;
  listings_count: number;
}

export interface UserRow {
  user_id: string;
  full_name: string | null;
  role: string;
  created_at: string;
  email: string | null;
}

export interface PendingVerification {
  id: string;
  name: string;
  slug: string;
  verification_status: string;
  created_at: string;
}

export interface AgencyFilters {
  plan?: string;
  verification_status?: string;
  page?: number;
  pageSize?: number;
}

export interface UserFilters {
  role?: string;
  page?: number;
  pageSize?: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Aggregate counts from each major table.
 * Uses anon client — RLS policies for super_admin allow SELECT on all tables.
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const supabase = await createClient();

  const [usersRes, agenciesRes, listingsRes, leadsRes] = await Promise.all([
    supabase.from("profiles").select("user_id", { count: "exact", head: true }),
    supabase.from("agencies").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    totalAgencies: agenciesRes.count ?? 0,
    totalListings: listingsRes.count ?? 0,
    totalLeads: leadsRes.count ?? 0,
  };
}

/**
 * Fetch all agencies with optional filters and pagination.
 * Returns agencies joined with subscription plan name and listing count.
 */
export async function getAllAgencies(
  filters: AgencyFilters = {}
): Promise<{ agencies: AgencyRow[]; total: number }> {
  const supabase = await createClient();
  const { plan, verification_status, page = 1, pageSize = 20 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("agencies")
    .select(
      "id, name, slug, is_verified, verification_status, created_at, deleted_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (verification_status && verification_status !== "all") {
    query = query.eq("verification_status", verification_status);
  }

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);

  const rows = data ?? [];

  // Batch-fetch listing counts in a single query instead of N individual requests
  const agencyIds = rows.map((a) => a.id);
  const countMap = new Map<string, number>();

  if (agencyIds.length > 0) {
    // Use individual count queries per agency instead of fetching all rows
    const countResults = await Promise.all(
      agencyIds.map((id) =>
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("agency_id", id)
          .then((res) => ({ id, count: res.count ?? 0 }))
      )
    );

    countResults.forEach((r) => {
      countMap.set(r.id, r.count);
    });
  }

  const agencies: AgencyRow[] = rows.map((agency) => ({
    id: agency.id,
    name: agency.name,
    slug: agency.slug,
    plan: plan ?? null,
    is_verified: agency.is_verified,
    verification_status: agency.verification_status,
    created_at: agency.created_at,
    deleted_at: agency.deleted_at,
    listings_count: countMap.get(agency.id) ?? 0,
  }));

  return { agencies, total: count ?? 0 };
}

/**
 * Fetch all user profiles with optional role filter and pagination.
 */
export async function getAllUsers(
  filters: UserFilters = {}
): Promise<{ users: UserRow[]; total: number }> {
  const supabase = await createClient();
  const { role, page = 1, pageSize = 20 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("profiles")
    .select("user_id, full_name, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (role && role !== "all") {
    query = query.eq("role", role);
  }

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);

  const users: UserRow[] = (data ?? []).map((p) => ({
    user_id: p.user_id,
    full_name: p.full_name,
    role: p.role,
    created_at: p.created_at,
    email: null, // auth.users not accessible via anon client
  }));

  return { users, total: count ?? 0 };
}

/**
 * Fetch agencies awaiting verification review.
 */
export async function getPendingVerifications(): Promise<PendingVerification[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agencies")
    .select("id, name, slug, verification_status, created_at")
    .eq("verification_status", "pending")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []) as PendingVerification[];
}

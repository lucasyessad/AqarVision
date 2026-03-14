/**
 * Server-side auth utility: resolve the current user's agency context.
 *
 * Cascade:
 *   1. Verify Supabase session (unauthenticated → AuthError)
 *   2. Look for an active owner membership → AgencyAuth{ role: "owner" }
 *   3. Look for any active admin membership → AgencyAuth{ role: "admin" }
 *   4. Return AuthError{ code: "not_found" } if no matching membership
 */

import { createClient } from "@/lib/supabase/server";
import type { AnyAgencyRole } from "@/features/agencies/schemas/agency.schema";

// ── Output types ─────────────────────────────────────────────────────────────

export interface AgencyAuth {
  userId: string;
  agencyId: string;
  role: AnyAgencyRole;
  agencySlug: string;
  agencyName: string;
}

export interface AuthError {
  code:
    | "unauthenticated"   // No valid Supabase session
    | "no_agency"         // User has no active agency membership
    | "not_found"         // No owner/admin membership found in cascade
    | "db_error";         // Unexpected database error
  message: string;
}

export type AgencyAuthResult = AgencyAuth | AuthError;

// ── Type guard ────────────────────────────────────────────────────────────────

export function isAuthError(result: AgencyAuthResult): result is AuthError {
  return "code" in result;
}

export function isAgencyAuth(result: AgencyAuthResult): result is AgencyAuth {
  return "agencyId" in result;
}

// ── Main utility ──────────────────────────────────────────────────────────────

/**
 * Resolve the current user's primary agency context from the Supabase session.
 *
 * Priority cascade:
 *   owner  →  admin  →  AuthError{ code: "not_found" }
 *
 * Use this in Server Components and Server Actions that require agency context.
 *
 * @example
 * const result = await getAgencyForCurrentUser();
 * if (isAuthError(result)) {
 *   redirect(`/auth/login`);
 * }
 * // result is AgencyAuth
 */
export async function getAgencyForCurrentUser(): Promise<AgencyAuthResult> {
  const supabase = await createClient();

  // 1. Verify auth session
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return {
      code: "unauthenticated",
      message: "No active session. Please sign in.",
    };
  }

  // 2. Fetch all active memberships for this user (join agency for slug/name)
  const { data: memberships, error: memberError } = await supabase
    .from("agency_memberships")
    .select("agency_id, role, agencies(id, slug, name)")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (memberError) {
    return {
      code: "db_error",
      message: memberError.message,
    };
  }

  if (!memberships || memberships.length === 0) {
    return {
      code: "no_agency",
      message: "User has no active agency membership.",
    };
  }

  // 3. Cascade: owner first, then admin
  const PRIORITY: AnyAgencyRole[] = ["owner", "admin"];

  for (const targetRole of PRIORITY) {
    const match = memberships.find((m) => m.role === targetRole);
    if (match) {
      const agencyRaw = match.agencies;
      const agency = (Array.isArray(agencyRaw) ? agencyRaw[0] ?? null : agencyRaw) as { id: string; slug: string; name: string } | null | undefined;
      if (!agency) continue;

      return {
        userId: user.id,
        agencyId: agency.id,
        role: match.role as AnyAgencyRole,
        agencySlug: agency.slug,
        agencyName: agency.name,
      };
    }
  }

  // 4. No owner/admin found — user is an agent/editor/viewer, return not_found
  return {
    code: "not_found",
    message: "No owner or admin membership found for this user.",
  };
}

/**
 * Variant that accepts any active membership role (owner | admin | agent | editor | viewer).
 * Use when you only need to confirm agency membership without role restrictions.
 */
export async function getAnyAgencyForCurrentUser(): Promise<AgencyAuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return {
      code: "unauthenticated",
      message: "No active session. Please sign in.",
    };
  }

  const { data: memberships, error: memberError } = await supabase
    .from("agency_memberships")
    .select("agency_id, role, agencies(id, slug, name)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1);

  if (memberError) {
    return {
      code: "db_error",
      message: memberError.message,
    };
  }

  if (!memberships || memberships.length === 0) {
    return {
      code: "no_agency",
      message: "User has no active agency membership.",
    };
  }

  const match = memberships[0];
  if (!match) {
    return {
      code: "no_agency",
      message: "User has no active agency membership.",
    };
  }
  const agencyRaw = match.agencies;
  const agency = (Array.isArray(agencyRaw) ? agencyRaw[0] ?? null : agencyRaw) as { id: string; slug: string; name: string } | null | undefined;

  if (!agency) {
    return {
      code: "db_error",
      message: "Agency data missing from membership record.",
    };
  }

  return {
    userId: user.id,
    agencyId: agency.id,
    role: match.role as AnyAgencyRole,
    agencySlug: agency.slug,
    agencyName: agency.name,
  };
}

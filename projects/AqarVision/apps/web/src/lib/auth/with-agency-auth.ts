"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import type { AnyAgencyRole } from "@/features/agencies/schemas/agency.schema";

export type AgencyRole = AnyAgencyRole;
export type Resource = "listing" | "team_member" | "invitation" | "billing" | "settings" | "analytics" | "media" | "ai_job";
export type Permission = "create" | "read" | "update" | "delete";

export type AgencyAuthContext = {
  userId: string;
  agencyId: string;
  role: AgencyRole;
};

type ActionError = { success: false; error: { code: string; message: string } };
type ActionOk<T> = { success: true; data: T };

const PERMISSION_MAP: Record<AgencyRole, Record<Resource, ReadonlySet<Permission>>> = {
  owner:  { listing: new Set(["create","read","update","delete"]), team_member: new Set(["create","read","update","delete"]), invitation: new Set(["create","read","update","delete"]), billing: new Set(["create","read","update","delete"]), settings: new Set(["create","read","update","delete"]), analytics: new Set(["create","read","update","delete"]), media: new Set(["create","read","update","delete"]), ai_job: new Set(["create","read","update","delete"]) },
  admin:  { listing: new Set(["create","read","update","delete"]), team_member: new Set(["create","read","update"]), invitation: new Set(["create","read","update","delete"]), billing: new Set(["read"]), settings: new Set(["create","read","update"]), analytics: new Set(["create","read","update","delete"]), media: new Set(["create","read","update","delete"]), ai_job: new Set(["create","read","update","delete"]) },
  agent:  { listing: new Set(["create","read","update"]), team_member: new Set(["read"]), invitation: new Set([]), billing: new Set([]), settings: new Set(["read"]), analytics: new Set(["read"]), media: new Set(["create","read","update"]), ai_job: new Set(["create","read"]) },
  editor: { listing: new Set(["read","update"]), team_member: new Set(["read"]), invitation: new Set([]), billing: new Set([]), settings: new Set(["read"]), analytics: new Set(["read"]), media: new Set(["create","read","update"]), ai_job: new Set(["create","read"]) },
  viewer: { listing: new Set(["read"]), team_member: new Set(["read"]), invitation: new Set([]), billing: new Set([]), settings: new Set([]), analytics: new Set(["read"]), media: new Set(["read"]), ai_job: new Set([]) },
};

function hasPermission(role: AgencyRole, resource: Resource, permission: Permission): boolean {
  return PERMISSION_MAP[role]?.[resource]?.has(permission) ?? false;
}

/**
 * Auth + membership + RBAC guard for agency server actions.
 * Returns ActionResult<T> — wraps errors automatically.
 */
export async function withAgencyAuth<T>(
  agencyId: string,
  resource: Resource,
  permission: Permission,
  handler: (ctx: AgencyAuthContext) => Promise<T>
): Promise<ActionOk<T> | ActionError> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } };
  }

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("role")
    .eq("agency_id", agencyId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!membership) {
    return { success: false, error: { code: "FORBIDDEN", message: "Not a member of this agency" } };
  }

  const role = membership.role as AgencyRole;

  if (!hasPermission(role, resource, permission)) {
    logger.warn({ userId: user.id, resource, action: permission, agencyId }, "permission denied");
    return { success: false, error: { code: "FORBIDDEN", message: `Role "${role}" cannot ${permission} ${resource}` } };
  }

  try {
    const data = await handler({ userId: user.id, agencyId, role });
    return { success: true, data };
  } catch (err) {
    logger.error({ err, userId: user.id, resource, action: permission }, "withAgencyAuth error");
    if (err instanceof Error) {
      return { success: false, error: { code: err.name === "OPTIMISTIC_LOCK_CONFLICT" ? "OPTIMISTIC_LOCK_CONFLICT" : "ACTION_FAILED", message: err.message } };
    }
    return { success: false, error: { code: "ACTION_FAILED", message: "An error occurred" } };
  }
}

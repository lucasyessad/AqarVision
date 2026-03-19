"use server";

import { createClient } from "@/lib/supabase/server";
import { fail, type ActionResult } from "@/lib/action-result";

type Resource =
  | "listing"
  | "team_member"
  | "invitation"
  | "billing"
  | "settings"
  | "analytics"
  | "media";

type Permission = "create" | "read" | "update" | "delete";

interface AuthContext {
  userId: string;
  agencyId: string;
  role: string;
}

const ROLE_PERMISSIONS: Record<string, Record<Resource, Permission[]>> = {
  owner: {
    listing: ["create", "read", "update", "delete"],
    team_member: ["create", "read", "update", "delete"],
    invitation: ["create", "read", "update", "delete"],
    billing: ["create", "read", "update", "delete"],
    settings: ["create", "read", "update", "delete"],
    analytics: ["create", "read", "update", "delete"],
    media: ["create", "read", "update", "delete"],
  },
  admin: {
    listing: ["create", "read", "update", "delete"],
    team_member: ["create", "read", "update"],
    invitation: [],
    billing: ["read"],
    settings: ["create", "read", "update"],
    analytics: ["create", "read", "update", "delete"],
    media: ["create", "read", "update", "delete"],
  },
  agent: {
    listing: ["create", "read", "update"],
    team_member: ["read"],
    invitation: [],
    billing: [],
    settings: ["read"],
    analytics: ["read"],
    media: ["create", "read", "update"],
  },
  editor: {
    listing: ["read", "update"],
    team_member: ["read"],
    invitation: [],
    billing: [],
    settings: ["read"],
    analytics: ["read"],
    media: ["create", "read", "update"],
  },
  viewer: {
    listing: ["read"],
    team_member: ["read"],
    invitation: [],
    billing: [],
    settings: [],
    analytics: ["read"],
    media: ["read"],
  },
};

function hasPermission(
  role: string,
  resource: Resource,
  permission: Permission
): boolean {
  const rolePerms = ROLE_PERMISSIONS[role];
  if (!rolePerms) return false;
  return rolePerms[resource]?.includes(permission) ?? false;
}

export async function withAgencyAuth<T>(
  agencyId: string,
  resource: Resource,
  permission: Permission,
  handler: (ctx: AuthContext) => Promise<T>
): Promise<ActionResult<T>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail("UNAUTHORIZED", "Vous devez être connecté");
  }

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("agency_id", agencyId)
    .eq("is_active", true)
    .single();

  if (!membership) {
    return fail("FORBIDDEN", "Vous n'êtes pas membre de cette agence");
  }

  if (!hasPermission(membership.role, resource, permission)) {
    return fail(
      "FORBIDDEN",
      "Vous n'avez pas la permission d'effectuer cette action"
    );
  }

  try {
    const data = await handler({
      userId: user.id,
      agencyId,
      role: membership.role,
    });
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur interne";
    return fail("INTERNAL_ERROR", message);
  }
}

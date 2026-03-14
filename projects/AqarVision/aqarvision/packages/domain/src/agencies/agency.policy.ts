import type { AgencyRole } from "./agency.types";

const ROLE_HIERARCHY: Record<AgencyRole, number> = {
  owner: 5,
  admin: 4,
  agent: 3,
  editor: 2,
  viewer: 1,
};

/**
 * Check if a role has at least the same rank as the required role.
 */
export function hasMinimumRole(
  userRole: AgencyRole,
  requiredRole: AgencyRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Only an owner can transfer ownership. Only owners and admins can manage members.
 */
export function canManageMembers(userRole: AgencyRole): boolean {
  return hasMinimumRole(userRole, "admin");
}

/**
 * Check if a user can invite someone with the target role.
 * Users can only invite members with a lower role than their own.
 */
export function canInviteWithRole(
  inviterRole: AgencyRole,
  targetRole: AgencyRole
): boolean {
  if (!canManageMembers(inviterRole)) return false;
  return ROLE_HIERARCHY[inviterRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Check if a user can remove another member.
 * Users can only remove members with a lower role.
 */
export function canRemoveMember(
  removerRole: AgencyRole,
  targetRole: AgencyRole
): boolean {
  if (!canManageMembers(removerRole)) return false;
  return ROLE_HIERARCHY[removerRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Only the owner can delete the agency.
 */
export function canDeleteAgency(userRole: AgencyRole): boolean {
  return userRole === "owner";
}

/**
 * Check if a user can change the role of a member.
 * The actor must outrank both the current and new role.
 */
export function canChangeRole(
  actorRole: AgencyRole,
  currentRole: AgencyRole,
  newRole: AgencyRole
): boolean {
  if (!canManageMembers(actorRole)) return false;
  return (
    ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[currentRole] &&
    ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[newRole]
  );
}

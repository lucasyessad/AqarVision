import { ErrorWithCode } from "@aqarvision/domain";

export type AgencyRole = "owner" | "admin" | "agent" | "editor" | "viewer";

export type Resource =
  | "listing"
  | "team_member"
  | "invitation"
  | "billing"
  | "settings"
  | "analytics"
  | "media"
  | "ai_job";

export type Permission = "create" | "read" | "update" | "delete";

type PermissionSet = ReadonlySet<Permission>;

const ALL: PermissionSet = new Set(["create", "read", "update", "delete"]);
const READ_ONLY: PermissionSet = new Set(["read"]);
const CRU: PermissionSet = new Set(["create", "read", "update"]);
const CR: PermissionSet = new Set(["create", "read"]);
const NONE: PermissionSet = new Set();

const PERMISSION_MAP: Record<AgencyRole, Record<Resource, PermissionSet>> = {
  owner: {
    listing: ALL,
    team_member: ALL,
    invitation: ALL,
    billing: ALL,
    settings: ALL,
    analytics: ALL,
    media: ALL,
    ai_job: ALL,
  },
  admin: {
    listing: ALL,
    team_member: CRU,
    invitation: ALL,
    billing: READ_ONLY,
    settings: CRU,
    analytics: ALL,
    media: ALL,
    ai_job: ALL,
  },
  agent: {
    listing: CRU,
    team_member: READ_ONLY,
    invitation: NONE,
    billing: NONE,
    settings: READ_ONLY,
    analytics: READ_ONLY,
    media: CRU,
    ai_job: CR,
  },
  editor: {
    listing: new Set(["read", "update"]),
    team_member: READ_ONLY,
    invitation: NONE,
    billing: NONE,
    settings: READ_ONLY,
    analytics: READ_ONLY,
    media: CRU,
    ai_job: CR,
  },
  viewer: {
    listing: READ_ONLY,
    team_member: READ_ONLY,
    invitation: NONE,
    billing: NONE,
    settings: NONE,
    analytics: READ_ONLY,
    media: READ_ONLY,
    ai_job: NONE,
  },
};

/**
 * Check whether a role has a specific permission on a resource.
 */
export function hasPermission(
  role: AgencyRole,
  resource: Resource,
  permission: Permission
): boolean {
  const rolePermissions = PERMISSION_MAP[role];
  const resourcePermissions = rolePermissions[resource];
  return resourcePermissions.has(permission);
}

/**
 * Assert that a role has a specific permission on a resource.
 * Throws ErrorWithCode.Forbidden if not.
 */
export function assertPermission(
  role: AgencyRole,
  resource: Resource,
  permission: Permission
): void {
  if (!hasPermission(role, resource, permission)) {
    throw ErrorWithCode.Forbidden(
      `Role "${role}" does not have "${permission}" permission on "${resource}"`
    );
  }
}

/**
 * Get all permissions for a role on a resource.
 */
export function getPermissions(
  role: AgencyRole,
  resource: Resource
): readonly Permission[] {
  return Array.from(PERMISSION_MAP[role][resource]);
}

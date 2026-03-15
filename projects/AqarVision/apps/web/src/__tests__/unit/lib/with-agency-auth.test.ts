import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — vi.hoisted() pour éviter le problème de hoisting de vi.mock()
// ---------------------------------------------------------------------------

const { mockGetUser, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

vi.mock("@/lib/logger/index", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// On mocke aussi le chemin sans /index pour couvrir les deux résolutions possibles
vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import type { Resource, Permission } from "@/lib/auth/with-agency-auth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AGENCY_ID = "agency-uuid-1234";
const USER_ID = "user-uuid-5678";

/** Prépare le mock Supabase pour retourner un utilisateur authentifié avec un rôle donné */
function setupMocks(role: string | null) {
  mockGetUser.mockResolvedValue({
    data: { user: role !== null ? { id: USER_ID } : null },
    error: null,
  });

  const mockSingle = vi.fn().mockResolvedValue({
    data: role ? { role } : null,
    error: role ? null : { message: "Not found" },
  });

  const mockEq3 = vi.fn().mockReturnValue({ single: mockSingle });
  const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
  const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

  mockFrom.mockReturnValue({ select: mockSelect });
}

/** Exécute withAgencyAuth avec un handler trivial retournant true */
async function checkPermission(role: string, resource: Resource, permission: Permission) {
  setupMocks(role);
  const result = await withAgencyAuth(AGENCY_ID, resource, permission, async () => true);
  return result;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("withAgencyAuth — RBAC permission map", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Cas d'erreur d'authentification
  // -------------------------------------------------------------------------

  describe("utilisateur non authentifié", () => {
    it("retourne UNAUTHORIZED si aucun utilisateur n'est connecté", async () => {
      setupMocks(null);
      const result = await withAgencyAuth(AGENCY_ID, "listing", "read", async () => true);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("utilisateur non membre", () => {
    it("retourne FORBIDDEN si l'utilisateur n'est pas membre de l'agence", async () => {
      // getUser retourne un user mais from().select()... retourne null
      mockGetUser.mockResolvedValue({
        data: { user: { id: USER_ID } },
        error: null,
      });
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } });
      const mockEq3 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await withAgencyAuth(AGENCY_ID, "listing", "read", async () => true);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("FORBIDDEN");
        expect(result.error.message).toContain("Not a member");
      }
    });
  });

  // -------------------------------------------------------------------------
  // owner — peut tout faire sur toutes les ressources
  // -------------------------------------------------------------------------

  describe("rôle : owner", () => {
    const allResources: Resource[] = ["listing", "team_member", "invitation", "billing", "settings", "analytics", "media", "ai_job"];
    const allPermissions: Permission[] = ["create", "read", "update", "delete"];

    it.each(
      allResources.flatMap((r) => allPermissions.map((p) => [r, p] as [Resource, Permission]))
    )("peut '%s' sur '%s'", async (resource, permission) => {
      const result = await checkPermission("owner", resource, permission);
      expect(result.success).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // viewer — seulement read sur listing ; pas create
  // -------------------------------------------------------------------------

  describe("rôle : viewer", () => {
    it("peut 'read' sur 'listing'", async () => {
      const result = await checkPermission("viewer", "listing", "read");
      expect(result.success).toBe(true);
    });

    it("ne peut pas 'create' sur 'listing'", async () => {
      const result = await checkPermission("viewer", "listing", "create");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("FORBIDDEN");
      }
    });

    it("ne peut pas 'update' sur 'listing'", async () => {
      const result = await checkPermission("viewer", "listing", "update");
      expect(result.success).toBe(false);
    });

    it("ne peut pas 'delete' sur 'listing'", async () => {
      const result = await checkPermission("viewer", "listing", "delete");
      expect(result.success).toBe(false);
    });

    it("peut 'read' sur 'team_member'", async () => {
      const result = await checkPermission("viewer", "team_member", "read");
      expect(result.success).toBe(true);
    });

    it("ne peut pas 'create' sur 'team_member'", async () => {
      const result = await checkPermission("viewer", "team_member", "create");
      expect(result.success).toBe(false);
    });

    it("ne peut rien faire sur 'billing'", async () => {
      const result = await checkPermission("viewer", "billing", "read");
      expect(result.success).toBe(false);
    });

    it("peut 'read' sur 'analytics'", async () => {
      const result = await checkPermission("viewer", "analytics", "read");
      expect(result.success).toBe(true);
    });

    it("ne peut rien faire sur 'ai_job'", async () => {
      const result = await checkPermission("viewer", "ai_job", "create");
      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // agent — peut create listing mais pas delete team_member
  // -------------------------------------------------------------------------

  describe("rôle : agent", () => {
    it("peut 'create' sur 'listing'", async () => {
      const result = await checkPermission("agent", "listing", "create");
      expect(result.success).toBe(true);
    });

    it("peut 'read' sur 'listing'", async () => {
      const result = await checkPermission("agent", "listing", "read");
      expect(result.success).toBe(true);
    });

    it("peut 'update' sur 'listing'", async () => {
      const result = await checkPermission("agent", "listing", "update");
      expect(result.success).toBe(true);
    });

    it("ne peut pas 'delete' sur 'listing'", async () => {
      const result = await checkPermission("agent", "listing", "delete");
      expect(result.success).toBe(false);
    });

    it("ne peut pas 'delete' sur 'team_member'", async () => {
      const result = await checkPermission("agent", "team_member", "delete");
      expect(result.success).toBe(false);
    });

    it("ne peut pas 'create' sur 'team_member'", async () => {
      const result = await checkPermission("agent", "team_member", "create");
      expect(result.success).toBe(false);
    });

    it("peut 'read' sur 'team_member'", async () => {
      const result = await checkPermission("agent", "team_member", "read");
      expect(result.success).toBe(true);
    });

    it("ne peut rien faire sur 'billing'", async () => {
      for (const perm of ["create", "read", "update", "delete"] as Permission[]) {
        const result = await checkPermission("agent", "billing", perm);
        expect(result.success, `agent ne devrait pas pouvoir '${perm}' billing`).toBe(false);
      }
    });

    it("ne peut rien faire sur 'invitation'", async () => {
      const result = await checkPermission("agent", "invitation", "create");
      expect(result.success).toBe(false);
    });

    it("peut 'create' sur 'ai_job'", async () => {
      const result = await checkPermission("agent", "ai_job", "create");
      expect(result.success).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // editor — peut update listing mais pas delete
  // -------------------------------------------------------------------------

  describe("rôle : editor", () => {
    it("peut 'read' sur 'listing'", async () => {
      const result = await checkPermission("editor", "listing", "read");
      expect(result.success).toBe(true);
    });

    it("peut 'update' sur 'listing'", async () => {
      const result = await checkPermission("editor", "listing", "update");
      expect(result.success).toBe(true);
    });

    it("ne peut pas 'create' sur 'listing'", async () => {
      const result = await checkPermission("editor", "listing", "create");
      expect(result.success).toBe(false);
    });

    it("ne peut pas 'delete' sur 'listing'", async () => {
      const result = await checkPermission("editor", "listing", "delete");
      expect(result.success).toBe(false);
    });

    it("ne peut pas 'delete' sur 'team_member'", async () => {
      const result = await checkPermission("editor", "team_member", "delete");
      expect(result.success).toBe(false);
    });

    it("ne peut pas 'create' sur 'team_member'", async () => {
      const result = await checkPermission("editor", "team_member", "create");
      expect(result.success).toBe(false);
    });

    it("ne peut rien faire sur 'billing'", async () => {
      const result = await checkPermission("editor", "billing", "read");
      expect(result.success).toBe(false);
    });

    it("peut 'create' sur 'media'", async () => {
      const result = await checkPermission("editor", "media", "create");
      expect(result.success).toBe(true);
    });

    it("peut 'read' sur 'settings'", async () => {
      const result = await checkPermission("editor", "settings", "read");
      expect(result.success).toBe(true);
    });

    it("ne peut pas 'create' sur 'settings'", async () => {
      const result = await checkPermission("editor", "settings", "create");
      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // admin — peut gérer team_member mais pas billing.create
  // -------------------------------------------------------------------------

  describe("rôle : admin", () => {
    it("peut 'create' sur 'team_member'", async () => {
      const result = await checkPermission("admin", "team_member", "create");
      expect(result.success).toBe(true);
    });

    it("peut 'read' sur 'team_member'", async () => {
      const result = await checkPermission("admin", "team_member", "read");
      expect(result.success).toBe(true);
    });

    it("peut 'update' sur 'team_member'", async () => {
      const result = await checkPermission("admin", "team_member", "update");
      expect(result.success).toBe(true);
    });

    it("ne peut pas 'delete' sur 'team_member'", async () => {
      // admin peut create/read/update mais PAS delete sur team_member
      const result = await checkPermission("admin", "team_member", "delete");
      expect(result.success).toBe(false);
    });

    it("peut 'read' sur 'billing'", async () => {
      const result = await checkPermission("admin", "billing", "read");
      expect(result.success).toBe(true);
    });

    it("ne peut pas 'create' sur 'billing'", async () => {
      const result = await checkPermission("admin", "billing", "create");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("FORBIDDEN");
        expect(result.error.message).toContain("billing");
      }
    });

    it("ne peut pas 'update' sur 'billing'", async () => {
      const result = await checkPermission("admin", "billing", "update");
      expect(result.success).toBe(false);
    });

    it("ne peut pas 'delete' sur 'billing'", async () => {
      const result = await checkPermission("admin", "billing", "delete");
      expect(result.success).toBe(false);
    });

    it("peut 'create' sur 'listing'", async () => {
      const result = await checkPermission("admin", "listing", "create");
      expect(result.success).toBe(true);
    });

    it("peut 'delete' sur 'listing'", async () => {
      const result = await checkPermission("admin", "listing", "delete");
      expect(result.success).toBe(true);
    });

    it("peut 'create' sur 'invitation'", async () => {
      const result = await checkPermission("admin", "invitation", "create");
      expect(result.success).toBe(true);
    });

    it("peut 'delete' sur 'invitation'", async () => {
      const result = await checkPermission("admin", "invitation", "delete");
      expect(result.success).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Comportement du handler
  // -------------------------------------------------------------------------

  describe("handler et contexte", () => {
    it("appelle le handler avec le bon AgencyAuthContext si l'autorisation est accordée", async () => {
      setupMocks("agent");
      const handler = vi.fn().mockResolvedValue({ ok: true });

      const result = await withAgencyAuth(AGENCY_ID, "listing", "create", handler);

      expect(result.success).toBe(true);
      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith({
        userId: USER_ID,
        agencyId: AGENCY_ID,
        role: "agent",
      });
    });

    it("propage le résultat du handler dans data", async () => {
      setupMocks("owner");
      const result = await withAgencyAuth(AGENCY_ID, "listing", "create", async () => "ma-donnée");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("ma-donnée");
      }
    });

    it("retourne ACTION_FAILED si le handler lève une erreur générique", async () => {
      setupMocks("owner");
      const result = await withAgencyAuth(AGENCY_ID, "listing", "create", async () => {
        throw new Error("erreur inattendue");
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("ACTION_FAILED");
        expect(result.error.message).toBe("erreur inattendue");
      }
    });

    it("retourne OPTIMISTIC_LOCK_CONFLICT si le handler lève une erreur avec ce nom", async () => {
      setupMocks("owner");
      const lockError = new Error("Version conflict");
      lockError.name = "OPTIMISTIC_LOCK_CONFLICT";

      const result = await withAgencyAuth(AGENCY_ID, "listing", "update", async () => {
        throw lockError;
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("OPTIMISTIC_LOCK_CONFLICT");
      }
    });

    it("ne pas appeler le handler si la permission est refusée", async () => {
      setupMocks("viewer");
      const handler = vi.fn();

      await withAgencyAuth(AGENCY_ID, "listing", "create", handler);

      expect(handler).not.toHaveBeenCalled();
    });
  });
});

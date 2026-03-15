"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

type ActionError = { success: false; error: { code: string; message: string } };
type ActionOk<T> = { success: true; data: T };

export type SuperAdminContext = { userId: string };

/**
 * Auth + super-admin guard for admin server actions.
 * Returns ActionResult<T> — wraps errors automatically.
 */
export async function withSuperAdminAuth<T>(
  handler: (ctx: SuperAdminContext) => Promise<T>
): Promise<ActionOk<T> | ActionError> {
  const supabase = await createClient();
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Session invalide. Veuillez vous reconnecter." },
    };
  }

  const { data: isSuperAdmin, error: rpcError } = await supabase.rpc("is_super_admin", {
    p_user_id: user.id,
  });

  if (rpcError || !isSuperAdmin) {
    logger.warn({ userId: user.id }, "super admin access denied");
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Accès réservé aux super administrateurs." },
    };
  }

  try {
    const data = await handler({ userId: user.id });
    return { success: true, data };
  } catch (err) {
    logger.error({ err, userId: user.id }, "withSuperAdminAuth error");
    if (err instanceof Error) {
      return { success: false, error: { code: "ACTION_FAILED", message: err.message } };
    }
    return { success: false, error: { code: "ACTION_FAILED", message: "Une erreur est survenue." } };
  }
}

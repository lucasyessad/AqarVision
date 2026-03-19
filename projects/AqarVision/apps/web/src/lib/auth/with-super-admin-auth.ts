"use server";

import { createClient } from "@/lib/supabase/server";
import { fail, type ActionResult } from "@/lib/action-result";

interface AdminContext {
  userId: string;
}

export async function withSuperAdminAuth<T>(
  handler: (ctx: AdminContext) => Promise<T>
): Promise<ActionResult<T>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail("UNAUTHORIZED", "Vous devez être connecté");
  }

  const { data: isAdmin } = await supabase.rpc("is_super_admin");
  if (!isAdmin) {
    return fail("FORBIDDEN", "Accès réservé aux super administrateurs");
  }

  try {
    const data = await handler({ userId: user.id });
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur interne";
    return fail("INTERNAL_ERROR", message);
  }
}

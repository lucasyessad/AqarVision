"use server";

import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { sendMessage, markAsRead } from "../services/messaging.service";
import { updateTag } from "next/cache";
import { CacheTags } from "@/lib/cache/tags";
import type { Message } from "../types/messaging.types";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z
    .string()
    .min(1, "Le message ne peut pas être vide")
    .max(5000, "Message trop long")
    .transform(sanitizeInput),
});

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<ActionResult<Message>> {
  const parsed = sendMessageSchema.safeParse({ conversationId, content });
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Données invalides");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("UNAUTHORIZED", "Vous devez être connecté");
  }

  try {
    const message = await sendMessage(
      supabase,
      parsed.data.conversationId,
      user.id,
      parsed.data.content
    );
    updateTag(CacheTags.conversations(user.id));
    return ok(message);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    return fail("INTERNAL_ERROR", msg);
  }
}

export async function markAsReadAction(
  conversationId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("UNAUTHORIZED", "Vous devez être connecté");
  }

  try {
    await markAsRead(supabase, conversationId, user.id);
    updateTag(CacheTags.conversations(user.id));
    return ok(undefined);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    return fail("INTERNAL_ERROR", msg);
  }
}

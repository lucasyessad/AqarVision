"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { listMessages } from "../services/messaging.service";
import type { MessageDto } from "../types/messaging.types";

const ConversationIdSchema = z.string().uuid();

export async function getMessagesAction(conversationId: string): Promise<MessageDto[]> {
  const parsed = ConversationIdSchema.safeParse(conversationId);
  if (!parsed.success) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return listMessages(supabase, parsed.data).catch(() => []);
}

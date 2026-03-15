"use server";

import { createClient } from "@/lib/supabase/server";
import { listMessages } from "../services/messaging.service";
import type { MessageDto } from "../types/messaging.types";

export async function getMessagesAction(conversationId: string): Promise<MessageDto[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return listMessages(supabase, conversationId).catch(() => []);
}

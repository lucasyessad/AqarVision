import { createClient } from "@/lib/supabase/server";
import { listConversations, listMessages } from "@/features/messaging/services/messaging.service";
import { EspaceMessagerieClient } from "./EspaceMessagerieClient";

export default async function EspaceMessageriePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const conversations = await listConversations(supabase, user.id).catch(() => []);

  // Pre-load messages for the first conversation
  const firstConv = conversations[0] ?? null;
  const initialMessages = firstConv
    ? await listMessages(supabase, firstConv.id).catch(() => [])
    : [];

  return (
    <EspaceMessagerieClient
      conversations={conversations}
      initialMessages={initialMessages}
      firstConvId={firstConv?.id ?? null}
      currentUserId={user.id}
    />
  );
}

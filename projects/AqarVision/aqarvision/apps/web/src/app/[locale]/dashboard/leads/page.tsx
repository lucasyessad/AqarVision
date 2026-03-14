import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { listConversations, listMessages } from "@/features/messaging/services/messaging.service";
import { LeadsPageClient } from "./LeadsPageClient";

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const conversations = await listConversations(supabase, user.id);

  // Pre-fetch messages for the first conversation
  let initialMessages: Awaited<ReturnType<typeof listMessages>> = [];
  if (conversations.length > 0) {
    initialMessages = await listMessages(supabase, conversations[0]!.id);
  }

  return (
    <LeadsPageClient
      conversations={conversations}
      initialMessages={initialMessages}
      currentUserId={user.id}
    />
  );
}

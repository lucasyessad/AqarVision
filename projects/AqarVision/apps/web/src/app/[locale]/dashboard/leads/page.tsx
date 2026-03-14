import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { listConversations, listMessages } from "@/features/messaging/services/messaging.service";
import { getLeadsByAgency } from "@/features/leads/services/leads.service";
import { LeadsPageClient } from "./LeadsPageClient";
import { LeadsKanban } from "@/features/leads/components/LeadsKanban";

export default async function LeadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { locale } = await params;
  const { view } = await searchParams;
  const activeView = view === "pipeline" ? "pipeline" : "messages";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Get membership for CRM view
  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  // Fetch data depending on active view
  let conversations: Awaited<ReturnType<typeof listConversations>> = [];
  let initialMessages: Awaited<ReturnType<typeof listMessages>> = [];
  let leadsByStatus: Awaited<ReturnType<typeof getLeadsByAgency>> | null = null;

  if (activeView === "messages") {
    conversations = await listConversations(supabase, user.id);
    if (conversations.length > 0) {
      initialMessages = await listMessages(supabase, conversations[0]!.id);
    }
  } else if (activeView === "pipeline" && membership) {
    leadsByStatus = await getLeadsByAgency(supabase, membership.agency_id as string);
  }

  return (
    <div className="flex h-full flex-col">
      {/* View toggle */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-700">Prospects & Messages</h1>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <a
            href="/dashboard/leads?view=messages"
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeView === "messages"
                ? "bg-blue-night text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Messages
          </a>
          <a
            href="/dashboard/leads?view=pipeline"
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeView === "pipeline"
                ? "bg-blue-night text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pipeline CRM
          </a>
        </div>
      </div>

      {/* Content */}
      {activeView === "messages" ? (
        <LeadsPageClient
          conversations={conversations}
          initialMessages={initialMessages}
          currentUserId={user.id}
        />
      ) : membership && leadsByStatus ? (
        <LeadsKanban
          initialLeads={leadsByStatus}
          agencyId={membership.agency_id as string}
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm">
          <p className="text-gray-500">
            Vous devez appartenir à une agence pour accéder au pipeline CRM.
          </p>
        </div>
      )}
    </div>
  );
}

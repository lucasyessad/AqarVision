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

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

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
    <div className="flex h-full flex-col space-y-4">
      {/* Header + toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal-950)" }}>
            Prospects &amp; Messages
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--charcoal-500)" }}>
            Gérez vos conversations et votre pipeline CRM.
          </p>
        </div>
        <div
          className="flex rounded-md border p-0.5"
          style={{ borderColor: "#E3E8EF", background: "#F6F9FC" }}
        >
          {(["messages", "pipeline"] as const).map((v) => {
            const isActive = activeView === v;
            return (
              <a
                key={v}
                href={`/dashboard/leads?view=${v}`}
                className="rounded px-4 py-1.5 text-sm font-medium transition-all"
                style={
                  isActive
                    ? { background: "var(--coral)", color: "white" }
                    : { color: "var(--charcoal-600)" }
                }
              >
                {v === "messages" ? "Messages" : "Pipeline CRM"}
              </a>
            );
          })}
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
        <div className="flex items-center justify-center rounded-lg border bg-white py-16" style={{ borderColor: "#E3E8EF" }}>
          <p className="text-sm" style={{ color: "var(--charcoal-500)" }}>
            Vous devez appartenir à une agence pour accéder au pipeline CRM.
          </p>
        </div>
      )}
    </div>
  );
}

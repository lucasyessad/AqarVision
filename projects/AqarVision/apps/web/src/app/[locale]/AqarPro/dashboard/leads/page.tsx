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

  if (!user) redirect(`/${locale}/AqarPro/auth/login`);

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
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Prospects &amp; Messages
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gérez vos conversations et votre pipeline CRM.
          </p>
        </div>
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
          {(["messages", "pipeline"] as const).map((v) => {
            const isActive = activeView === v;
            return (
              <a
                key={v}
                href={`/dashboard/leads?view=${v}`}
                className={`rounded px-4 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500 text-white"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
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
        <div className="flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-16 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Vous devez appartenir à une agence pour accéder au pipeline CRM.
          </p>
        </div>
      )}
    </div>
  );
}

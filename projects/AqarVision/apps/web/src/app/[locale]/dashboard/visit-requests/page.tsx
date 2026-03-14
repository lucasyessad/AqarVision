import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVisitRequestsByAgency } from "@/features/visit-requests/services/visit-requests.service";
import { VisitRequestsPageClient } from "./VisitRequestsPageClient";

export default async function VisitRequestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status: statusFilter } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) {
    redirect(`/${locale}/agency/new`);
  }

  const agencyId = membership.agency_id as string;

  const visitRequests = await getVisitRequestsByAgency(
    supabase,
    agencyId,
    statusFilter as "pending" | "confirmed" | "cancelled" | "done" | undefined
  );

  return (
    <VisitRequestsPageClient
      visitRequests={visitRequests}
      agencyId={agencyId}
      statusFilter={statusFilter ?? "all"}
    />
  );
}

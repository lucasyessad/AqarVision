import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { TeamTable, InviteMemberDialog } from "@/features/agencies/components";
import { Link } from "@/lib/i18n/navigation";
import type { MembershipDto } from "@/features/agencies/types/agency.types";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("agencies");
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

  if (!membership) redirect(`/${locale}/agency/new`);

  const { data: rawMembers } = await supabase
    .from("agency_memberships")
    .select("id, agency_id, user_id, role, is_active, joined_at")
    .eq("agency_id", membership.agency_id);

  const userIds = (rawMembers ?? []).map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  const members: MembershipDto[] = (rawMembers ?? []).map((m) => ({
    id: m.id,
    agency_id: m.agency_id,
    user_id: m.user_id,
    role: m.role,
    is_active: m.is_active,
    joined_at: m.joined_at ?? "",
    user_name: profileMap.get(m.user_id) ?? null,
    user_email: null,
  }));

  const { data: invites } = await supabase
    .from("agency_invites")
    .select("id, email, role, expires_at, accepted_at")
    .eq("agency_id", membership.agency_id)
    .is("accepted_at", null);

  const isAdminOrOwner = ["owner", "admin"].includes(membership.role);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal-950)" }}>
            {t("team_title")}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--charcoal-500)" }}>
            {members.length} membre{members.length !== 1 ? "s" : ""} dans votre agence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/team/invites"
            className="rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: "#E3E8EF", color: "var(--charcoal-700)" }}
          >
            Invitations
          </Link>
          {isAdminOrOwner && (
            <InviteMemberDialog
              agencyId={membership.agency_id}
              pendingInvites={
                (invites ?? []).map((i) => ({
                  id: i.id as string,
                  agency_id: membership.agency_id as string,
                  email: i.email as string,
                  role: i.role as string,
                  expires_at: i.expires_at as string,
                  accepted_at: i.accepted_at as string | null,
                }))
              }
            />
          )}
        </div>
      </div>

      {/* Team table card */}
      <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
            Membres actifs
          </h2>
        </div>
        <TeamTable
          members={members}
          agencyId={membership.agency_id}
          currentUserRole={membership.role}
        />
      </div>
    </div>
  );
}

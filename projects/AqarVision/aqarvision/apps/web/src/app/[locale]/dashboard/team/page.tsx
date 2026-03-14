import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { TeamTable, InviteMemberDialog } from "@/features/agencies/components";
import type { MembershipDto, InviteDto } from "@/features/agencies/types/agency.types";

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

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Get user's active membership
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

  // Fetch agency members with profiles
  const { data: rawMembers } = await supabase
    .from("agency_memberships")
    .select("id, agency_id, user_id, role, is_active, joined_at")
    .eq("agency_id", membership.agency_id);

  // Fetch profiles for members
  const userIds = (rawMembers ?? []).map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p.full_name])
  );

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

  // Fetch pending invites
  const { data: invites } = await supabase
    .from("agency_invites")
    .select("id, email, role, expires_at, accepted_at")
    .eq("agency_id", membership.agency_id)
    .is("accepted_at", null);

  const isAdminOrOwner = ["owner", "admin"].includes(membership.role);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-night">
          {t("team_title")}
        </h1>
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
      <TeamTable members={members} agencyId={membership.agency_id} currentUserRole={membership.role} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AcceptInvite } from "@/features/agencies/components";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?redirect=/${locale}/invite/${token}`);
  }

  // Fetch invite details
  const { data: invite } = await supabase
    .from("agency_invites")
    .select("id, agency_id, role, expires_at, accepted_at")
    .eq("token", token)
    .single();

  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off-white p-8">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">Invite not found</p>
        </div>
      </div>
    );
  }

  // Fetch agency name
  const { data: agency } = await supabase
    .from("agencies")
    .select("name")
    .eq("id", invite.agency_id)
    .single();

  const expired =
    invite.accepted_at !== null ||
    new Date(invite.expires_at) < new Date();

  return (
    <div className="flex min-h-screen items-center justify-center bg-off-white p-8">
      <AcceptInvite
        token={token}
        agencyName={agency?.name ?? "Unknown Agency"}
        role={invite.role}
        expired={expired}
      />
    </div>
  );
}

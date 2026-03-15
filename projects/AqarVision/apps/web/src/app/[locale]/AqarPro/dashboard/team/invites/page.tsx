import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export default async function InvitesPage({
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

  if (!user) redirect(`/${locale}/AqarPro/auth/login`);

  const { data: membership } = await supabase
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!membership) redirect(`/${locale}/agency/new`);

  const { data: invites } = await supabase
    .from("agency_invites")
    .select("id, email, role, expires_at, accepted_at, created_at")
    .eq("agency_id", membership.agency_id)
    .order("created_at", { ascending: false });

  const STATUS_MAP = {
    accepted: { label: "Acceptée", bg: "#F0FDF4", color: "#16A34A" },
    expired:  { label: "Expirée",  bg: "#F6F9FC", color: "var(--charcoal-400)" },
    pending:  { label: "En attente", bg: "#FFFBEB", color: "#D97706" },
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal-950)" }}>
          {t("invite_pending")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--charcoal-500)" }}>
          Historique des invitations envoyées à votre agence.
        </p>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "#E3E8EF", background: "#F6F9FC" }}>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-500)" }}>
                {t("member_email")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-500)" }}>
                {t("member_role")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-500)" }}>
                {t("member_status")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wide" style={{ color: "var(--charcoal-500)" }}>
                Expire le
              </th>
            </tr>
          </thead>
          <tbody>
            {invites && invites.length > 0 ? (
              invites.map((invite, i) => {
                const isExpired = new Date(invite.expires_at) < new Date();
                const statusKey = invite.accepted_at ? "accepted" : isExpired ? "expired" : "pending";
                const status = STATUS_MAP[statusKey];
                return (
                  <tr
                    key={invite.id}
                    className="border-b"
                    style={{ borderColor: i === invites.length - 1 ? "transparent" : "#E3E8EF" }}
                  >
                    <td className="px-6 py-4" style={{ color: "var(--charcoal-950)" }}>
                      {invite.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: "#EFF6FF", color: "#2563EB" }}
                      >
                        {invite.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs" style={{ color: "var(--charcoal-400)" }}>
                      {new Date(invite.expires_at).toLocaleDateString(locale)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm" style={{ color: "var(--charcoal-400)" }}>
                  Aucune invitation envoyée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

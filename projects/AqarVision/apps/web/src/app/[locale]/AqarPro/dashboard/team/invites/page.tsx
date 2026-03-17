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
    accepted: { label: "Acceptée", cls: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
    expired:  { label: "Expirée",  cls: "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500" },
    pending:  { label: "En attente", cls: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          {t("invite_pending")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Historique des invitations envoyées à votre agence.
        </p>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50">
              <th className="px-6 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                {t("member_email")}
              </th>
              <th className="px-6 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                {t("member_role")}
              </th>
              <th className="px-6 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                {t("member_status")}
              </th>
              <th className="px-6 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-zinc-400">
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
                    className={`h-12 hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-800/50 ${
                      i !== invites.length - 1 ? "border-b border-zinc-200 dark:border-zinc-700 dark:border-zinc-800" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-zinc-950 dark:text-zinc-50">
                      {invite.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        {invite.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(invite.expires_at).toLocaleDateString(locale)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
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

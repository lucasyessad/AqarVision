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

  const { data: invites } = await supabase
    .from("agency_invites")
    .select("id, email, role, expires_at, accepted_at, created_at")
    .eq("agency_id", membership.agency_id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-blue-night">
        {t("invite_pending")}
      </h1>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-start text-xs font-medium uppercase text-gray-500">
                {t("member_email")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase text-gray-500">
                {t("member_role")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase text-gray-500">
                {t("member_status")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium uppercase text-gray-500">
                Expires
              </th>
            </tr>
          </thead>
          <tbody>
            {invites && invites.length > 0 ? (
              invites.map((invite) => {
                const isExpired = new Date(invite.expires_at) < new Date();
                const status = invite.accepted_at
                  ? "accepted"
                  : isExpired
                    ? "expired"
                    : "pending";
                return (
                  <tr key={invite.id} className="border-b border-gray-50">
                    <td className="px-6 py-4 text-gray-700">{invite.email}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-night/10 px-2.5 py-0.5 text-xs font-medium text-blue-night">
                        {invite.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(invite.expires_at).toLocaleDateString(locale)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  No pending invites
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

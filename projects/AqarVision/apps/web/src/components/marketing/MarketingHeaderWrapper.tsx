import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "./MarketingHeader";

interface Props {
  locale: string;
}

export async function MarketingHeaderWrapper({ locale }: Props) {
  const supabase = await createClient();

  // Quick cookie-based check — no network call
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return <MarketingHeader locale={locale} user={null} />;
  }

  const user = session.user;

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
    supabase
      .from("agency_memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  const isPro =
    membership && ["owner", "admin", "agent"].includes(membership.role);
  const name =
    profile?.full_name || user.email?.split("@")[0] || "—";

  return (
    <MarketingHeader
      locale={locale}
      user={{
        name,
        initial: name.charAt(0).toUpperCase(),
        profileType: isPro ? "pro" : "chaab",
        espaceHref: isPro ? "/AqarPro/dashboard" : "/AqarChaab/espace",
      }}
    />
  );
}

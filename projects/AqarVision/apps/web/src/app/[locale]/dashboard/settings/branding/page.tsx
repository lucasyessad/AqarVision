import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAgencyForCurrentUser,
  isAuthError,
} from "@/lib/actions/auth";
import { BrandingUpload } from "@/features/agency-settings/components/BrandingUpload";

export default async function BrandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) {
    redirect(`/${locale}/auth/login`);
  }

  const supabase = await createClient();
  const { data: agency } = await supabase
    .from("agencies")
    .select("logo_url, cover_url, name")
    .eq("id", auth.agencyId)
    .single();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal-950)" }}>Branding</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--charcoal-500)" }}>
          Téléchargez le logo et l&apos;image de couverture de{" "}
          <strong>{agency?.name ?? auth.agencyName}</strong>.
        </p>
      </div>
      <BrandingUpload
        currentLogoUrl={agency?.logo_url ?? null}
        currentCoverUrl={agency?.cover_url ?? null}
      />
    </div>
  );
}

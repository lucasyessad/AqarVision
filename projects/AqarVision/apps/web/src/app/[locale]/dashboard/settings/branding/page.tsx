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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-night">Branding</h1>
        <p className="mt-1 text-sm text-gray-500">
          Téléchargez le logo et l&apos;image de couverture de{" "}
          <strong>{agency?.name ?? auth.agencyName}</strong>.
        </p>
      </div>

      <div className="max-w-2xl">
        <BrandingUpload
          currentLogoUrl={agency?.logo_url ?? null}
          currentCoverUrl={agency?.cover_url ?? null}
        />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAgencyForCurrentUser,
  isAuthError,
} from "@/lib/actions/auth";
import { VerificationForm } from "@/features/agency-settings/components/VerificationForm";

export default async function VerificationPage({
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
    .select("is_verified, verification_status")
    .eq("id", auth.agencyId)
    .single();

  // Normalise: if is_verified is true but column is missing/none → treat as verified
  const verificationStatus: string =
    (agency as { is_verified?: boolean; verification_status?: string } | null)
      ?.verification_status ??
    (agency?.is_verified ? "verified" : "none");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-night">
          Vérification de l&apos;agence
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Obtenez le badge de confiance AqarVision en vérifiant votre agence.
        </p>
      </div>

      <div className="max-w-2xl">
        <VerificationForm initialStatus={verificationStatus} />
      </div>
    </div>
  );
}

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
    redirect(`/${locale}/AqarPro/auth/login`);
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
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Vérification de l&apos;agence
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Obtenez le badge de confiance AqarVision en vérifiant votre agence.
        </p>
      </div>
      <VerificationForm initialStatus={verificationStatus} />
    </div>
  );
}

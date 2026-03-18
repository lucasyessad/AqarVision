import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getVerificationRequests } from "@/features/admin/services/admin.service";
import { VerificationReviewer } from "@/features/admin/components/VerificationReviewer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("adminVerifications") };
}

export default async function AdminVerificationsPage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();

  const requests = await getVerificationRequests(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("verifications")}
      </h1>
      <VerificationReviewer initialRequests={requests} />
    </div>
  );
}

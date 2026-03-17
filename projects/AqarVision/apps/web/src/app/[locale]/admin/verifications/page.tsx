import { getTranslations } from "next-intl/server";
import { getPendingVerifications } from "@/features/admin/services/admin.service";
import { VerificationQueueClient } from "./VerificationQueueClient";

export default async function AdminVerificationsPage() {
  const t = await getTranslations("admin");
  const verifications = await getPendingVerifications();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t("verifications_title")}</h1>
        <p className="mt-1 text-sm text-gray-400">
          {t("verifications_count", { count: verifications.length })}
        </p>
      </div>

      <VerificationQueueClient verifications={verifications} />
    </div>
  );
}

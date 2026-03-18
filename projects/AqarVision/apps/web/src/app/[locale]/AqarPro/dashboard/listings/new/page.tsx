import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { getAgencyForUser } from "@/lib/auth/get-agency-for-user";
import { WizardListing } from "@/features/listings/components/WizardListing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("newListing") };
}

export default async function NewListingPage() {
  const t = await getTranslations("listing");
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const agencyCtx = await getAgencyForUser(user.id);

  if (!agencyCtx) {
    redirect("/AqarPro/dashboard");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("new")}
      </h1>

      <div className="max-w-3xl mx-auto">
        <WizardListing mode={{ type: "agency", agencyId: agencyCtx.agencyId }} />
      </div>
    </div>
  );
}

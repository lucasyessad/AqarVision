import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { redirect } from "next/navigation";
import { WizardListing } from "@/features/listings/components/WizardListing";
import { DeposerChaabWrapper } from "./deposer-wrapper";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("deposit") };
}

export default async function DeposerPage() {
  const t = await getTranslations("nav");
  const user = await getCachedUser();

  if (!user) {
    redirect("/deposer");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("deposit")}
      </h1>

      <DeposerChaabWrapper userId={user.id} />
    </div>
  );
}

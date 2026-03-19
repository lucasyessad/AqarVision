import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { getAgencyForUser } from "@/lib/auth/get-agency-for-user";
import { redirect } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { DeferredAuthDeposer } from "./deferred-auth-deposer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("deposit") };
}

export default async function DeposerPublicPage() {
  const t = await getTranslations("nav");
  const user = await getCachedUser();

  // If already logged in, redirect to the right wizard
  if (user) {
    const agency = await getAgencyForUser(user.id);
    if (agency) {
      redirect("/AqarPro/dashboard/listings/new");
    }
    redirect("/AqarChaab/espace/deposer");
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12 lg:py-16">
        {/* Logo + back to home */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 mb-6"
          >
            Aqar<span className="text-teal-600 dark:text-teal-400">Vision</span>
          </Link>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            {t("deposit")}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Commencez sans inscription — connectez-vous plus tard
          </p>
        </div>

        <DeferredAuthDeposer />
      </div>
    </div>
  );
}

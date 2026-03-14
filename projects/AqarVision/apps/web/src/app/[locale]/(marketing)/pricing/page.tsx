import { createClient } from "@/lib/supabase/server";
import { getPlans } from "@/features/billing/services/billing.service";
import { PricingTable } from "@/features/billing/components";
import { getTranslations } from "next-intl/server";

export default async function PricingPage() {
  const supabase = await createClient();
  const t = await getTranslations("billing");
  const plans = await getPlans(supabase);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-blue-night sm:text-4xl">
          {t("pricing_title")}
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          {t("features")}
        </p>
      </div>

      <PricingTable plans={plans} currentPlanCode={null} agencyId={null} />
    </div>
  );
}

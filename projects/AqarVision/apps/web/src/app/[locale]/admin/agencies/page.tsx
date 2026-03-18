import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getAgencies } from "@/features/admin/services/admin.service";
import { AgenciesList } from "@/features/admin/components/AgenciesList";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("adminAgencies") };
}

const PER_PAGE = 20;

export default async function AdminAgenciesPage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();

  const result = await getAgencies(supabase, {
    page: 1,
    per_page: PER_PAGE,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("agencies")}
      </h1>
      <AgenciesList
        initialAgencies={result.data}
        initialTotal={result.total}
        initialPage={1}
        perPage={PER_PAGE}
      />
    </div>
  );
}

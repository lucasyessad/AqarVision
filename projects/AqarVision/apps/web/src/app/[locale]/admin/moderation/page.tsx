import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getModerationQueue } from "@/features/admin/services/admin.service";
import { ModerationQueue } from "@/features/admin/components/ModerationQueue";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("adminModeration") };
}

const PER_PAGE = 20;

export default async function AdminModerationPage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();

  const result = await getModerationQueue(supabase, {
    page: 1,
    per_page: PER_PAGE,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("moderation")}
      </h1>
      <ModerationQueue
        initialItems={result.data}
        initialTotal={result.total}
        initialPage={1}
        perPage={PER_PAGE}
      />
    </div>
  );
}

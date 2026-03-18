import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUsers } from "@/features/admin/services/admin.service";
import { UsersList } from "@/features/admin/components/UsersList";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("adminUsers") };
}

const PER_PAGE = 30;

export default async function AdminUsersPage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();

  const result = await getUsers(supabase, {
    page: 1,
    per_page: PER_PAGE,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("users")}
      </h1>
      <UsersList
        initialUsers={result.data}
        initialTotal={result.total}
        initialPage={1}
        perPage={PER_PAGE}
      />
    </div>
  );
}

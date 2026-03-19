import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Bell } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("notifications") };
}

export default async function NotificationsPage() {
  const t = await getTranslations("nav");
  const tEmpty = await getTranslations("common.empty");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("notifications")}
      </h1>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bell className="h-12 w-12 text-stone-300 dark:text-stone-600 mb-4" />
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {tEmpty("noNotifications")}
        </p>
      </div>
    </div>
  );
}

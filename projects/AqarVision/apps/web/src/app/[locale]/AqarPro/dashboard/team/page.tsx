import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UserPlus, Users } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("team") };
}

export default async function TeamPage() {
  const t = await getTranslations("nav");
  const tCommon = await getTranslations("common.buttons");
  const tEmpty = await getTranslations("common.empty");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {t("team")}
        </h1>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-teal-600 dark:bg-teal-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-fast"
        >
          <UserPlus className="h-4 w-4" />
          Inviter
        </button>
      </div>

      {/* Members table */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            Membres
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Invitez des membres pour collaborer
          </p>
        </div>
      </div>

      {/* Pending invitations */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            Invitations en attente
          </h3>
        </div>
        <div className="px-5 py-6 text-center">
          <p className="text-sm text-stone-400 dark:text-stone-500">
            {tEmpty("noPendingInvites")}
          </p>
        </div>
      </div>
    </div>
  );
}

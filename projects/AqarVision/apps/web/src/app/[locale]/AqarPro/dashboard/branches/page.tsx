import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GitBranch, Plus, MapPin } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("branches") };
}

export default async function BranchesPage() {
  const t = await getTranslations("nav");
  const tCommon = await getTranslations("common.buttons");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {t("branches")}
        </h1>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-teal-600 dark:bg-teal-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-fast"
        >
          <Plus className="h-4 w-4" />
          {tCommon("create")}
        </button>
      </div>

      {/* Headquarters */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Siège
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Succursale principale
            </p>
          </div>
        </div>
      </div>

      {/* Empty state for additional branches */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <GitBranch className="h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Ajoutez des succursales pour gérer plusieurs emplacements
        </p>
      </div>
    </div>
  );
}

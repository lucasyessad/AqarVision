"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updatePlatformSettingAction } from "@/features/admin/actions/platform-settings.action";
import type { SettingRow } from "@/features/admin/actions/platform-settings.action";

interface SettingsFormProps {
  setting: SettingRow;
}

export function SettingsForm({ setting }: SettingsFormProps) {
  const t = useTranslations("admin");
  const [state, action, pending] = useActionState(updatePlatformSettingAction, null);

  const displayValue = typeof setting.value === "string"
    ? setting.value
    : JSON.stringify(setting.value);

  return (
    <form
      action={action}
      className="flex flex-wrap items-center gap-4 px-5 py-4"
    >
      <input type="hidden" name="key" value={setting.key} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white/90 dark:text-zinc-100">{setting.key}</p>
        {setting.description && (
          <p className="mt-0.5 text-xs text-white/40 dark:text-zinc-400">{setting.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          name="value"
          defaultValue={displayValue}
          className="w-52 rounded-lg border border-white/[0.12] dark:border-zinc-700 bg-white/[0.06] dark:bg-zinc-800 px-3 py-1.5 text-sm font-mono text-zinc-50/90 dark:text-zinc-200"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-500 transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {pending ? t("saving") : t("save_button")}
        </button>
      </div>

      {state?.success === false && (
        <p className="w-full text-xs text-red-400">{state.error}</p>
      )}
      {state?.success === true && (
        <p className="w-full text-xs text-green-400">{t("saved")}</p>
      )}
    </form>
  );
}

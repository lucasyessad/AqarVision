"use client";

import { useActionState } from "react";
import { updatePlatformSettingAction } from "@/features/admin/actions/platform-settings.action";
import type { SettingRow } from "@/features/admin/actions/platform-settings.action";

interface SettingsFormProps {
  setting: SettingRow;
}

export function SettingsForm({ setting }: SettingsFormProps) {
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
        <p className="text-sm font-medium text-white/90">{setting.key}</p>
        {setting.description && (
          <p className="mt-0.5 text-xs text-white/40">{setting.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          name="value"
          defaultValue={displayValue}
          className="w-52 rounded-lg border px-3 py-1.5 text-sm font-mono"
          style={{
            background: "rgba(255,255,255,0.06)",
            borderColor: "rgba(255,255,255,0.12)",
            color: "rgba(253,251,247,0.9)",
          }}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-500 transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: "rgba(245,158,11,0.15)" }}
        >
          {pending ? "…" : "Sauver"}
        </button>
      </div>

      {state?.success === false && (
        <p className="w-full text-xs text-red-400">{state.error}</p>
      )}
      {state?.success === true && (
        <p className="w-full text-xs text-green-400">Enregistré</p>
      )}
    </form>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { signOutAction } from "../actions/auth.action";

interface UserMenuProps {
  email: string;
  fullName?: string | null;
}

export function UserMenu({ email, fullName }: UserMenuProps) {
  const t = useTranslations("auth");

  return (
    <div className="border-t border-white/10 p-4">
      <div className="mb-2">
        <p className="truncate text-sm font-medium text-white">
          {fullName || email}
        </p>
        {fullName && (
          <p className="truncate text-xs text-white/60">{email}</p>
        )}
      </div>
      <div className="space-y-1">
        <Link
          href="/dashboard/settings"
          className="block rounded-lg px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {t("settings")}
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-1.5 text-start text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {t("logout")}
          </button>
        </form>
      </div>
    </div>
  );
}

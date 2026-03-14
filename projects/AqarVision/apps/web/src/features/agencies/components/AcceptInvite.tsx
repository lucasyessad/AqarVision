"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { acceptInviteAction } from "../actions/accept-invite.action";
import type { ActionResult, MembershipDto } from "../types/agency.types";

interface AcceptInviteProps {
  token: string;
  agencyName: string;
  role: string;
  expired: boolean;
}

export function AcceptInvite({
  token,
  agencyName,
  role,
  expired,
}: AcceptInviteProps) {
  const t = useTranslations("agencies");
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<
    ActionResult<MembershipDto> | null,
    FormData
  >(async (_prev, formData) => {
    const result = await acceptInviteAction(null, formData);
    if (result.success) {
      router.push("/dashboard");
    }
    return result;
  }, null);

  if (expired) {
    return (
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">{t("invite_expired")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-xl font-bold text-[#1a365d]">
        {t("accept_invite_title")}
      </h1>
      <p className="mb-6 text-gray-500">
        {agencyName} &mdash; {t(`role_${role}`)}
      </p>

      {state?.success === false && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {state.error.message}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[#1a365d] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a365d]/90 disabled:opacity-50"
        >
          {isPending ? t("accepting") : t("accept_invite")}
        </button>
      </form>
    </div>
  );
}

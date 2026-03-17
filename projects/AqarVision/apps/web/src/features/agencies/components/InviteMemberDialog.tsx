"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { inviteMemberAction } from "../actions/invite-member.action";
import { AGENCY_ROLES } from "../schemas/agency.schema";
import type { ActionResult, InviteDto } from "../types/agency.types";

interface InviteMemberDialogProps {
  agencyId: string;
  pendingInvites: InviteDto[];
}

export function InviteMemberDialog({
  agencyId,
  pendingInvites,
}: InviteMemberDialogProps) {
  const t = useTranslations("agencies");
  const [isOpen, setIsOpen] = useState(false);

  const [state, formAction, isPending] = useActionState<
    ActionResult<InviteDto> | null,
    FormData
  >(inviteMemberAction, null);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      >
        {t("invite_member")}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {t("invite_member")}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {state?.success === false && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {state.error.message}
              </div>
            )}

            {state?.success === true && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                {t("invite_sent")}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="agency_id" value={agencyId} />

              <div>
                <label
                  htmlFor="invite-email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t("email")}
                </label>
                <input
                  id="invite-email"
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                />
              </div>

              <div>
                <label
                  htmlFor="invite-role"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t("role")}
                </label>
                <select
                  id="invite-role"
                  name="role"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                >
                  {AGENCY_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {t(`role_${role}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                >
                  {isPending ? t("sending") : t("send_invite")}
                </button>
              </div>
            </form>

            {pendingInvites.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="mb-3 text-sm font-medium text-gray-600">
                  {t("pending_invites")}
                </h4>
                <ul className="space-y-2">
                  {pendingInvites.map((invite) => (
                    <li
                      key={invite.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="text-gray-700">{invite.email}</span>
                      <span className="rounded-full border border-gray-200 bg-white dark:bg-zinc-900 px-2 py-0.5 text-xs text-gray-500">
                        {t(`role_${invite.role}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import type { MembershipDto } from "../types/agency.types";
import type { AnyAgencyRole } from "../schemas/agency.schema";
import { AGENCY_ROLES } from "../schemas/agency.schema";
import {
  changeMemberRoleAction,
  deactivateMemberAction,
} from "../actions/manage-team.action";
import type { ActionResult } from "../types/agency.types";

interface TeamTableProps {
  members: MembershipDto[];
  agencyId: string;
  currentUserRole: AnyAgencyRole;
}

const ROLE_STYLES: Record<AnyAgencyRole, string> = {
  owner: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  agent: "bg-green-100 text-green-700 border-green-200",
  editor: "bg-gray-100 text-gray-600 border-gray-200",
  viewer: "bg-gray-50 text-gray-500 border-gray-100",
};

const canManage = (role: AnyAgencyRole): boolean =>
  role === "owner" || role === "admin";

export function TeamTable({
  members,
  agencyId,
  currentUserRole,
}: TeamTableProps) {
  const t = useTranslations("agencies");
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(
    null
  );

  const [roleState, roleAction, isRolePending] = useActionState<
    ActionResult<{ updated: boolean }> | null,
    FormData
  >(changeMemberRoleAction, null);

  const [deactivateState, deactivateAction, isDeactivatePending] =
    useActionState<
      ActionResult<{ deactivated: boolean }> | null,
      FormData
    >(deactivateMemberAction, null);

  const showActions = canManage(currentUserRole);

  return (
    <div className="overflow-x-auto rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
      {roleState?.success === false && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {roleState.error.message}
        </div>
      )}
      {deactivateState?.success === false && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {deactivateState.error.message}
        </div>
      )}

      <table className="w-full text-start text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="py-3 pe-4 ps-6 text-start text-xs font-medium uppercase text-gray-500">
              {t("member_name")}
            </th>
            <th className="py-3 pe-4 text-start text-xs font-medium uppercase text-gray-500">
              {t("member_email")}
            </th>
            <th className="py-3 pe-4 text-start text-xs font-medium uppercase text-gray-500">
              {t("member_role")}
            </th>
            <th className="py-3 pe-4 text-start text-xs font-medium uppercase text-gray-500">
              {t("member_status")}
            </th>
            {showActions && (
              <th className="py-3 pe-6 text-start text-xs font-medium uppercase text-gray-500">
                {t("actions")}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr
              key={member.id}
              className="border-b border-gray-50 last:border-0"
            >
              <td className="py-4 pe-4 ps-6 font-medium text-gray-700">
                {member.user_name ?? t("unnamed")}
              </td>
              <td className="py-4 pe-4 text-gray-500">
                {member.user_email ?? "-"}
              </td>
              <td className="py-4 pe-4">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[member.role]}`}
                >
                  {t(`role_${member.role}`)}
                </span>
              </td>
              <td className="py-4 pe-4">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    member.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {member.is_active ? t("active") : t("inactive")}
                </span>
              </td>
              {showActions && (
                <td className="py-4 pe-6">
                  {member.role !== "owner" && member.is_active && (
                    <div className="flex items-center gap-2">
                      <form action={roleAction}>
                        <input
                          type="hidden"
                          name="agency_id"
                          value={agencyId}
                        />
                        <input
                          type="hidden"
                          name="user_id"
                          value={member.user_id}
                        />
                        <select
                          name="new_role"
                          defaultValue={member.role}
                          onChange={(e) => {
                            const form = e.target.closest("form");
                            if (form) form.requestSubmit();
                          }}
                          disabled={isRolePending}
                          className="rounded border border-gray-200 px-2 py-1 text-xs focus:border-zinc-900 focus:outline-none"
                        >
                          {AGENCY_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {t(`role_${role}`)}
                            </option>
                          ))}
                        </select>
                      </form>

                      {confirmDeactivate === member.user_id ? (
                        <div className="flex items-center gap-1">
                          <form action={deactivateAction}>
                            <input
                              type="hidden"
                              name="agency_id"
                              value={agencyId}
                            />
                            <input
                              type="hidden"
                              name="user_id"
                              value={member.user_id}
                            />
                            <button
                              type="submit"
                              disabled={isDeactivatePending}
                              className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              {t("confirm")}
                            </button>
                          </form>
                          <button
                            type="button"
                            onClick={() => setConfirmDeactivate(null)}
                            className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-300"
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDeactivate(member.user_id)
                          }
                          className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                        >
                          {t("deactivate")}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {members.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">
          {t("no_members")}
        </p>
      )}
    </div>
  );
}

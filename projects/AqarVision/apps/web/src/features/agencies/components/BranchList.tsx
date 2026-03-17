"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { createBranchAction } from "../actions/branch.action";
import type { ActionResult, BranchDto } from "../types/agency.types";

interface BranchListProps {
  branches: BranchDto[];
  agencyId: string;
  canCreate: boolean;
}

export function BranchList({ branches, agencyId, canCreate }: BranchListProps) {
  const t = useTranslations("agencies");
  const [showForm, setShowForm] = useState(false);

  const [state, formAction, isPending] = useActionState<
    ActionResult<BranchDto> | null,
    FormData
  >(createBranchAction, null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{t("branches")}</h3>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            {showForm ? t("cancel") : t("add_branch")}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          {state?.success === false && (
            <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.error.message}
            </div>
          )}

          {state?.success === true && (
            <div className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-600">
              {t("branch_created")}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="agency_id" value={agencyId} />

            <div>
              <label
                htmlFor="branch-name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {t("branch_name")}
              </label>
              <input
                id="branch-name"
                type="text"
                name="name"
                required
                minLength={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              />
            </div>

            <div>
              <label
                htmlFor="branch-wilaya"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {t("wilaya")}
              </label>
              <input
                id="branch-wilaya"
                type="text"
                name="wilaya_code"
                required
                placeholder={t("wilaya_code_placeholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              />
            </div>

            <div>
              <label
                htmlFor="branch-address"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {t("address")}
              </label>
              <input
                id="branch-address"
                type="text"
                name="address_text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              {isPending ? t("creating") : t("create_branch")}
            </button>
          </form>
        </div>
      )}

      {branches.length > 0 ? (
        <ul className="space-y-3">
          {branches.map((branch) => (
            <li
              key={branch.id}
              className="rounded-xl border border-gray-200 bg-white dark:bg-zinc-900 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">{branch.name}</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {t("wilaya")}: {branch.wilaya_code}
                  </p>
                  {branch.address_text && (
                    <p className="mt-0.5 text-sm text-gray-400">
                      {branch.address_text}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-sm text-gray-400">
          {t("no_branches")}
        </p>
      )}
    </div>
  );
}

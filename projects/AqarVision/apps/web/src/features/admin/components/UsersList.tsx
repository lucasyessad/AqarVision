"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Building2,
  Mail,
} from "lucide-react";
import type { AdminUser } from "../types/admin.types";

interface UsersListProps {
  initialUsers: AdminUser[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  end_user: {
    label: "Utilisateur",
    color: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
  },
  super_admin: {
    label: "Super Admin",
    color: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  },
};

export function UsersList({
  initialUsers,
  initialTotal,
  initialPage,
  perPage,
}: UsersListProps) {
  const tEmpty = useTranslations("common.empty");
  const [users] = useState(initialUsers);
  const [total] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const totalPages = Math.ceil(total / perPage);

  const filtered = users.filter((u) => {
    if (filterRole && u.role !== filterRole) return false;
    if (
      search &&
      !`${u.first_name} ${u.last_name} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 ps-9 pe-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value="">Tous les rôles</option>
          <option value="end_user">Utilisateur</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_100px_80px_120px] gap-4 px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Nom
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Email
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Rôle
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Agences
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Inscrit le
          </span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Users className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
            <p className="text-sm text-stone-400 dark:text-stone-500">
              {tEmpty("noUsers")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filtered.map((user) => {
              const role =
                roleLabels[user.role] ?? roleLabels["end_user"];

              return (
                <div
                  key={user.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_2fr_100px_80px_120px] gap-2 md:gap-4 px-4 py-3 items-center hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 shrink-0">
                        <User className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      {user.phone && (
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 hidden md:block" />
                    <span className="truncate">{user.email}</span>
                  </div>

                  {/* Role */}
                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        role?.color
                      )}
                    >
                      {role?.label}
                    </span>
                  </div>

                  {/* Agencies count */}
                  <div className="flex items-center gap-1 text-sm text-stone-700 dark:text-stone-300">
                    {user.agencies_count > 0 && (
                      <Building2 className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                    )}
                    <span>{user.agencies_count}</span>
                  </div>

                  {/* Created */}
                  <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                    <Calendar className="h-3.5 w-3.5 hidden md:block" />
                    <span>
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Page {page} sur {totalPages} ({total} utilisateurs)
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

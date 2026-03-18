"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  ScrollText,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Calendar,
} from "lucide-react";
import type { AuditLogEntry, AuditLogFilters } from "../types/admin.types";

interface AuditLogViewerProps {
  initialLogs: AuditLogEntry[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

const actionColors: Record<string, string> = {
  "listing.approved": "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  "listing.rejected": "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  "listing.hidden": "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  "verification.approve": "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  "verification.reject": "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  "payment.approved": "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
};

export function AuditLogViewer({
  initialLogs,
  initialTotal,
  initialPage,
  perPage,
}: AuditLogViewerProps) {
  const tEmpty = useTranslations("common.empty");
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchAction, setSearchAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const totalPages = Math.ceil(total / perPage);

  function getActorName(log: AuditLogEntry): string {
    if (log.actor) {
      return `${log.actor.first_name} ${log.actor.last_name}`;
    }
    return log.actor_id.slice(0, 8);
  }

  function getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      "listing.approved": "Annonce approuvée",
      "listing.rejected": "Annonce rejetée",
      "listing.hidden": "Annonce masquée",
      "verification.approve": "Vérification approuvée",
      "verification.reject": "Vérification rejetée",
      "payment.approved": "Paiement approuvé",
    };
    return labels[action] ?? action;
  }

  const filteredLogs = logs.filter((log) => {
    if (searchAction && !log.action.toLowerCase().includes(searchAction.toLowerCase())) {
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
            value={searchAction}
            onChange={(e) => setSearchAction(e.target.value)}
            placeholder="Filtrer par action..."
            className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 ps-9 pe-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-500 dark:text-stone-400">Du</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-teal-600"
          />
          <label className="text-xs text-stone-500 dark:text-stone-400">au</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-5 py-12 text-center">
          <ScrollText className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
          <p className="text-sm text-stone-400 dark:text-stone-500">
            {tEmpty("noEvents")}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_140px_40px] gap-4 px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              Date
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              Acteur
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              Action
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              Cible
            </span>
            <span />
          </div>

          {/* Rows */}
          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            const colorClass =
              actionColors[log.action] ??
              "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300";

            return (
              <div
                key={log.id}
                className="border-b border-stone-100 dark:border-stone-800 last:border-b-0"
              >
                <div
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_140px_40px] gap-2 md:gap-4 px-4 py-3 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors items-center"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : log.id)
                  }
                >
                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
                    <Calendar className="h-3.5 w-3.5 shrink-0 md:hidden" />
                    <span>
                      {new Date(log.created_at).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Actor */}
                  <div className="flex items-center gap-2">
                    {log.actor?.avatar_url ? (
                      <img
                        src={log.actor.avatar_url}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
                        <User className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                      </div>
                    )}
                    <span className="text-sm text-stone-700 dark:text-stone-300 truncate">
                      {getActorName(log)}
                    </span>
                  </div>

                  {/* Action */}
                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        colorClass
                      )}
                    >
                      {getActionLabel(log.action)}
                    </span>
                  </div>

                  {/* Target */}
                  <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                    {log.target_type && log.target_id
                      ? `${log.target_type} ${log.target_id.slice(0, 8)}...`
                      : "-"}
                  </div>

                  {/* Expand */}
                  <div className="text-stone-400 dark:text-stone-500">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Expanded metadata */}
                {isExpanded && (
                  <div className="px-4 pb-3">
                    <div className="rounded-md bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-3">
                      <h4 className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-wide">
                        Metadata
                      </h4>
                      <pre className="text-xs text-stone-700 dark:text-stone-300 overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Page {page} sur {totalPages} ({total} entrées)
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

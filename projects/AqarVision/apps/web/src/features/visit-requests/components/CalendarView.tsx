"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  Clock,
  User,
  Phone,
  MapPin,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { updateVisitRequestStatusAction } from "../actions/visit-request.action";
import type { VisitRequest } from "../types/visit-request.types";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00–19:00
const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const STATUS_BADGE_VARIANT: Record<VisitRequest["status"], "warning" | "success" | "default" | "danger"> = {
  pending: "warning",
  confirmed: "success",
  completed: "default",
  cancelled: "danger",
};

const STATUS_SLOT_CLASS: Record<VisitRequest["status"], string> = {
  pending:
    "bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300",
  confirmed:
    "bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300",
  completed:
    "bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400",
  cancelled:
    "bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300",
};

const SLOT_HOURS: Record<VisitRequest["preferred_time_slot"], number> = {
  morning: 9,
  afternoon: 14,
  evening: 18,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

export interface CalendarViewProps {
  visits: VisitRequest[];
  agencyId: string;
  locale?: string;
}

/* ------------------------------------------------------------------ */
/*  CalendarView                                                      */
/* ------------------------------------------------------------------ */

export function CalendarView({
  visits,
  agencyId,
  locale = "fr",
}: CalendarViewProps) {
  const t = useTranslations("visitRequests");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedVisit, setSelectedVisit] = useState<VisitRequest | null>(null);

  const weekStart = getWeekStart(currentDate);
  const weekDays = getWeekDays(weekStart);
  const today = new Date();

  function navigateWeek(direction: -1 | 1) {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + direction * 7);
    setCurrentDate(next);
  }

  function navigateDay(direction: -1 | 1) {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + direction);
    setCurrentDate(next);
  }

  function getVisitsForDayAndHour(day: Date, hour: number): VisitRequest[] {
    return visits.filter((v) => {
      const vDate = new Date(v.preferred_date);
      return isSameDay(vDate, day) && SLOT_HOURS[v.preferred_time_slot] === hour;
    });
  }

  function getVisitsForDay(day: Date): VisitRequest[] {
    return visits.filter((v) => isSameDay(new Date(v.preferred_date), day));
  }

  const weekLabel = `${weekDays[0]!.toLocaleDateString(locale, { day: "numeric", month: "short" })} - ${weekDays[6]!.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (viewMode === "calendar" ? navigateWeek(-1) : navigateDay(-1))}
            aria-label={t("previous")}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </Button>

          <span className="text-sm font-medium text-stone-700 dark:text-stone-300 min-w-[180px] text-center">
            {viewMode === "calendar"
              ? weekLabel
              : formatDate(currentDate, locale)}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => (viewMode === "calendar" ? navigateWeek(1) : navigateDay(1))}
            aria-label={t("next")}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            {t("today")}
          </Button>
        </div>

        <div className="flex items-center rounded-md border border-stone-200 dark:border-stone-700 overflow-hidden">
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
              viewMode === "calendar"
                ? "bg-teal-600 dark:bg-teal-500 text-white"
                : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
            )}
            aria-pressed={viewMode === "calendar"}
          >
            <Calendar size={14} aria-hidden="true" />
            <span className="hidden sm:inline">{t("calendar")}</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
              viewMode === "list"
                ? "bg-teal-600 dark:bg-teal-500 text-white"
                : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
            )}
            aria-pressed={viewMode === "list"}
          >
            <List size={14} aria-hidden="true" />
            <span className="hidden sm:inline">{t("list")}</span>
          </button>
        </div>
      </div>

      {/* Week grid (desktop) */}
      {viewMode === "calendar" && (
        <div className="hidden md:block overflow-auto rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
          <div
            className="grid min-w-[700px]"
            style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
            role="grid"
            aria-label={t("weekView")}
          >
            {/* Header row */}
            <div className="sticky top-0 z-10 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-2" />
            {weekDays.map((day, i) => (
              <div
                key={WEEKDAYS[i]}
                className={cn(
                  "sticky top-0 z-10 border-b border-stone-200 dark:border-stone-800 p-2 text-center",
                  "bg-stone-50 dark:bg-stone-900",
                  isSameDay(day, today) &&
                    "bg-teal-50 dark:bg-teal-950"
                )}
              >
                <div className="text-2xs font-medium uppercase text-stone-500 dark:text-stone-400">
                  {day.toLocaleDateString(locale, { weekday: "short" })}
                </div>
                <div
                  className={cn(
                    "text-sm font-semibold mt-0.5",
                    isSameDay(day, today)
                      ? "text-teal-700 dark:text-teal-400"
                      : "text-stone-800 dark:text-stone-200"
                  )}
                >
                  {day.getDate()}
                </div>
              </div>
            ))}

            {/* Hour rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="contents" role="row">
                {/* Time label */}
                <div className="border-e border-b border-stone-200 dark:border-stone-800 p-1 text-2xs text-stone-400 dark:text-stone-500 text-end pe-2 pt-2">
                  {`${hour}:00`}
                </div>

                {/* Day cells */}
                {weekDays.map((day, i) => {
                  const cellVisits = getVisitsForDayAndHour(day, hour);
                  return (
                    <div
                      key={`${WEEKDAYS[i]}-${hour}`}
                      className={cn(
                        "border-b border-e border-stone-100 dark:border-stone-800 min-h-[52px] p-0.5",
                        isSameDay(day, today) && "bg-teal-50/30 dark:bg-teal-950/20"
                      )}
                      role="gridcell"
                    >
                      {cellVisits.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVisit(v)}
                          className={cn(
                            "w-full rounded px-1.5 py-1 text-start text-2xs font-medium border cursor-pointer transition-opacity hover:opacity-80",
                            STATUS_SLOT_CLASS[v.status]
                          )}
                        >
                          <span className="block truncate">
                            {v.requester_name}
                          </span>
                          {v.listing_title && (
                            <span className="block truncate opacity-70 text-[10px]">
                              {v.listing_title}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day view (mobile) or list fallback */}
      {viewMode === "calendar" && (
        <div className="md:hidden flex flex-col gap-2">
          <DayColumn
            day={currentDate}
            visits={getVisitsForDay(currentDate)}
            locale={locale}
            onSelect={setSelectedVisit}
            t={t}
          />
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-2">
          {visits.length === 0 && (
            <p className="text-center text-sm text-stone-500 dark:text-stone-400 py-12">
              {t("noVisits")}
            </p>
          )}
          {visits.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVisit(v)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-start transition-colors",
                "border-stone-200 dark:border-stone-800",
                "bg-white dark:bg-stone-950",
                "hover:bg-stone-50 dark:hover:bg-stone-900"
              )}
            >
              <div
                className={cn(
                  "w-1 self-stretch rounded-full shrink-0",
                  v.status === "pending" && "bg-amber-400 dark:bg-amber-500",
                  v.status === "confirmed" && "bg-green-500 dark:bg-green-400",
                  v.status === "completed" && "bg-stone-400 dark:bg-stone-500",
                  v.status === "cancelled" && "bg-red-500 dark:bg-red-400"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {v.requester_name}
                  </span>
                  <Badge variant={STATUS_BADGE_VARIANT[v.status]} size="sm">
                    {t(`status.${v.status}`)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} aria-hidden="true" />
                    {new Date(v.preferred_date).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                    {" "}
                    {t(`slot.${v.preferred_time_slot}`)}
                  </span>
                  {v.listing_title && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin size={12} aria-hidden="true" />
                      {v.listing_title}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Drawer */}
      {selectedVisit && (
        <VisitDrawer
          visit={selectedVisit}
          agencyId={agencyId}
          locale={locale}
          onClose={() => setSelectedVisit(null)}
          t={t}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DayColumn — mobile day view                                       */
/* ------------------------------------------------------------------ */

function DayColumn({
  day,
  visits,
  locale,
  onSelect,
  t,
}: {
  day: Date;
  visits: VisitRequest[];
  locale: string;
  onSelect: (v: VisitRequest) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  if (visits.length === 0) {
    return (
      <p className="text-center text-sm text-stone-500 dark:text-stone-400 py-12">
        {t("noVisitsDay")}
      </p>
    );
  }

  const sorted = [...visits].sort(
    (a, b) => SLOT_HOURS[a.preferred_time_slot] - SLOT_HOURS[b.preferred_time_slot]
  );

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((v) => (
        <button
          key={v.id}
          onClick={() => onSelect(v)}
          className={cn(
            "rounded-lg border p-3 text-start transition-colors",
            STATUS_SLOT_CLASS[v.status],
            "hover:opacity-80"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{v.requester_name}</span>
            <Badge variant={STATUS_BADGE_VARIANT[v.status]} size="sm">
              {t(`status.${v.status}`)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
            <Clock size={12} aria-hidden="true" />
            {t(`slot.${v.preferred_time_slot}`)}
          </div>
          {v.listing_title && (
            <div className="mt-1 text-xs opacity-70 truncate">
              {v.listing_title}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VisitDrawer — side panel with details + actions                   */
/* ------------------------------------------------------------------ */

function VisitDrawer({
  visit,
  agencyId,
  locale,
  onClose,
  t,
}: {
  visit: VisitRequest;
  agencyId: string;
  locale: string;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [isPending, startTransition] = useTransition();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleStatusChange(status: "confirmed" | "completed" | "cancelled") {
    startTransition(async () => {
      await updateVisitRequestStatusAction(visit.id, status, agencyId);
      onClose();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" onKeyDown={handleKeyDown}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("visitDetails")}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-sm",
          "bg-white dark:bg-stone-950",
          "border-s border-stone-200 dark:border-stone-800",
          "shadow-xl overflow-y-auto",
          "animate-slide-in-right",
          "focus:outline-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            {t("visitDetails")}
          </h3>
          <button
            onClick={onClose}
            className={cn(
              "rounded-md p-1.5",
              "text-stone-400 dark:text-stone-500",
              "hover:text-stone-600 dark:hover:text-stone-300",
              "hover:bg-stone-100 dark:hover:bg-stone-800",
              "transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
            )}
            aria-label={t("close")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-5">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_BADGE_VARIANT[visit.status]}>
              {t(`status.${visit.status}`)}
            </Badge>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300">
              <User size={16} className="shrink-0 text-stone-400 dark:text-stone-500" aria-hidden="true" />
              <span>{visit.requester_name}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300">
              <Phone size={16} className="shrink-0 text-stone-400 dark:text-stone-500" aria-hidden="true" />
              <a
                href={`tel:${visit.requester_phone}`}
                className="text-teal-600 dark:text-teal-400 hover:underline"
                dir="ltr"
              >
                {visit.requester_phone}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300">
              <Clock size={16} className="shrink-0 text-stone-400 dark:text-stone-500" aria-hidden="true" />
              <span>
                {new Date(visit.preferred_date).toLocaleDateString(locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" — "}
                {t(`slot.${visit.preferred_time_slot}`)}
              </span>
            </div>
            {visit.listing_title && (
              <div className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                <MapPin size={16} className="shrink-0 mt-0.5 text-stone-400 dark:text-stone-500" aria-hidden="true" />
                <div>
                  <div className="font-medium">{visit.listing_title}</div>
                  {visit.listing_address && (
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {visit.listing_address}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {visit.message && (
            <div className="rounded-md bg-stone-50 dark:bg-stone-900 p-3 text-sm text-stone-600 dark:text-stone-400">
              {visit.message}
            </div>
          )}

          {/* Actions */}
          {visit.status === "pending" && (
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <Button
                variant="primary"
                size="md"
                loading={isPending}
                onClick={() => handleStatusChange("confirmed")}
                className="w-full"
              >
                {t("actions.confirm")}
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={isPending}
                onClick={() => handleStatusChange("cancelled")}
                className="w-full"
              >
                {t("actions.cancel")}
              </Button>
            </div>
          )}
          {visit.status === "confirmed" && (
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <Button
                variant="primary"
                size="md"
                loading={isPending}
                onClick={() => handleStatusChange("completed")}
                className="w-full"
              >
                {t("actions.complete")}
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={isPending}
                onClick={() => handleStatusChange("cancelled")}
                className="w-full"
              >
                {t("actions.cancel")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

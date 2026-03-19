"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangePickerProps {
  onChange: (range: DateRange) => void;
  presets?: string[];
  defaultPreset?: string;
  className?: string;
}

const DEFAULT_PRESETS = ["7j", "30j", "90j", "12m", "Custom"];

function getPresetRange(preset: string): DateRange | null {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (preset) {
    case "7j": {
      const from = new Date(to);
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case "30j": {
      const from = new Date(to);
      from.setDate(from.getDate() - 30);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case "90j": {
      const from = new Date(to);
      from.setDate(from.getDate() - 90);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case "12m": {
      const from = new Date(to);
      from.setFullYear(from.getFullYear() - 1);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    default:
      return null;
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(str: string): Date | null {
  const parts = str.split("-");
  if (parts.length !== 3) return null;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return isNaN(d.getTime()) ? null : d;
}

const MONTH_NAMES = [
  "Janvier", "F\u00e9vrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Ao\u00fbt", "Septembre", "Octobre", "Novembre", "D\u00e9cembre",
];

const DAY_NAMES = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];

interface MiniCalendarProps {
  value: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

function MiniCalendar({ value, onSelect, onClose }: MiniCalendarProps) {
  const today = new Date();
  const initial = value ?? today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div
      ref={calRef}
      className={cn(
        "absolute z-dropdown mt-1 rounded-lg p-3",
        "bg-white dark:bg-stone-900",
        "border border-stone-200 dark:border-stone-700",
        "shadow-lg",
        "w-[280px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className={cn(
            "p-1 rounded-md",
            "text-stone-500 dark:text-stone-400",
            "hover:bg-stone-100 dark:hover:bg-stone-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
          )}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className={cn(
            "p-1 rounded-md",
            "text-stone-500 dark:text-stone-400",
            "hover:bg-stone-100 dark:hover:bg-stone-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
          )}
          aria-label="Next month"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-stone-400 dark:text-stone-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(viewYear, viewMonth, day);
          const isSelected =
            value &&
            value.getFullYear() === viewYear &&
            value.getMonth() === viewMonth &&
            value.getDate() === day;
          const isToday =
            today.getFullYear() === viewYear &&
            today.getMonth() === viewMonth &&
            today.getDate() === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                onSelect(date);
                onClose();
              }}
              className={cn(
                "h-8 w-full rounded-md text-sm",
                "transition-colors duration-fast",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
                isSelected
                  ? "bg-teal-600 dark:bg-teal-500 text-white font-medium"
                  : isToday
                    ? "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  onChange,
  presets = DEFAULT_PRESETS,
  defaultPreset,
  className,
}: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<string>(
    defaultPreset ?? presets[0] ?? "7j"
  );
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromCal, setShowFromCal] = useState(false);
  const [showToCal, setShowToCal] = useState(false);

  const isCustom = activePreset === "Custom";

  // Fire onChange for preset on mount and preset change
  useEffect(() => {
    if (activePreset !== "Custom") {
      const range = getPresetRange(activePreset);
      if (range) {
        setFromDate(range.from);
        setToDate(range.to);
        onChange(range);
      }
    }
  }, [activePreset]); // eslint-disable-line react-hooks/exhaustive-deps

  function handlePresetClick(preset: string) {
    setActivePreset(preset);
    setShowFromCal(false);
    setShowToCal(false);
  }

  function handleFromSelect(date: Date) {
    date.setHours(0, 0, 0, 0);
    setFromDate(date);
    if (toDate && date <= toDate) {
      onChange({ from: date, to: toDate });
    }
  }

  function handleToSelect(date: Date) {
    date.setHours(23, 59, 59, 999);
    setToDate(date);
    if (fromDate && date >= fromDate) {
      onChange({ from: fromDate, to: date });
    }
  }

  const inputClass = cn(
    "h-9 rounded-md border px-3 ps-9 text-sm w-full",
    "bg-white dark:bg-stone-950",
    "border-stone-300 dark:border-stone-700",
    "text-stone-900 dark:text-stone-100",
    "placeholder:text-stone-400 dark:placeholder:text-stone-500",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2",
    "cursor-pointer"
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preset pills */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Date range presets">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            role="radio"
            aria-checked={activePreset === preset}
            onClick={() => handlePresetClick(preset)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium",
              "transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2",
              activePreset === preset
                ? "bg-teal-600 dark:bg-teal-500 text-white"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      {isCustom && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* From */}
          <div className="relative">
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
              D&eacute;but
            </label>
            <div className="relative">
              <Calendar
                size={14}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                readOnly
                value={fromDate ? formatDate(fromDate) : ""}
                placeholder="YYYY-MM-DD"
                onClick={() => {
                  setShowFromCal(!showFromCal);
                  setShowToCal(false);
                }}
                className={inputClass}
              />
            </div>
            {showFromCal && (
              <MiniCalendar
                value={fromDate}
                onSelect={handleFromSelect}
                onClose={() => setShowFromCal(false)}
              />
            )}
          </div>

          {/* To */}
          <div className="relative">
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
              Fin
            </label>
            <div className="relative">
              <Calendar
                size={14}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                readOnly
                value={toDate ? formatDate(toDate) : ""}
                placeholder="YYYY-MM-DD"
                onClick={() => {
                  setShowToCal(!showToCal);
                  setShowFromCal(false);
                }}
                className={inputClass}
              />
            </div>
            {showToCal && (
              <MiniCalendar
                value={toDate}
                onSelect={handleToSelect}
                onClose={() => setShowToCal(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

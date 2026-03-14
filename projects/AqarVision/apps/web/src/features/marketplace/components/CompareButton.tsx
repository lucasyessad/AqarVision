"use client";

import { useCompare } from "@/features/marketplace/hooks/useCompare";
import type { CompareItem } from "@/features/marketplace/hooks/useCompare";

interface CompareButtonProps {
  item: CompareItem;
}

export function CompareButton({ item }: CompareButtonProps) {
  const { toggle, isSelected } = useCompare();
  const selected = isSelected(item.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      aria-pressed={selected}
      title={selected ? "Retirer de la comparaison" : "Comparer"}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        selected
          ? "border-[#1a365d] bg-[#1a365d] text-white hover:bg-[#1a365d]/90"
          : "border-gray-200 bg-white text-[#2d3748] hover:border-[#1a365d] hover:text-[#1a365d]"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-3.5 w-3.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
        />
      </svg>
      {selected ? "Comparé" : "Comparer"}
    </button>
  );
}

/**
 * Floating bar displayed at the bottom of the page when 1+ listings are selected.
 */
export function CompareBar() {
  const { items, remove, clear, compareUrl } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white shadow-2xl md:bottom-0">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {/* Items */}
        <div className="flex flex-1 items-center gap-3 overflow-x-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
            >
              {item.cover_url ? (
                <img
                  src={item.cover_url}
                  alt={item.title}
                  className="h-8 w-10 rounded object-cover"
                />
              ) : (
                <div className="h-8 w-10 rounded bg-gray-200" />
              )}
              <div className="min-w-0">
                <p className="max-w-[120px] truncate text-xs font-medium text-[#2d3748]">
                  {item.title}
                </p>
                <p className="text-xs text-[#a0aec0]">
                  {new Intl.NumberFormat("fr-DZ").format(item.price)} {item.currency}
                </p>
              </div>
              <button
                onClick={() => remove(item.id)}
                className="shrink-0 rounded p-0.5 text-gray-400 hover:text-red-500"
                title="Retirer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 3 - items.length }).map((_, i) => (
            <div
              key={i}
              className="flex h-[52px] w-[120px] shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-200"
            >
              <span className="text-xs text-gray-300">+ annonce</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={clear}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
          >
            Effacer
          </button>
          <a
            href={compareUrl}
            className={`inline-flex items-center gap-2 rounded-lg bg-[#1a365d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a365d]/90 ${
              items.length < 2 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
            Comparer ({items.length})
          </a>
        </div>
      </div>
    </div>
  );
}

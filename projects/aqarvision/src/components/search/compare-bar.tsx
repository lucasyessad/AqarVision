'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Scale, X } from 'lucide-react';

const COMPARE_KEY = 'compare_ids';

interface CompareItem {
  id: string;
  title?: string;
}

function getCompareIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function clearCompareIds() {
  localStorage.setItem(COMPARE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('compareUpdate', { detail: [] }));
}

export function CompareBar() {
  const [items, setItems] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => {
      const ids = getCompareIds();
      setItems(ids);
      setVisible(ids.length >= 2);
    };

    sync();

    const handleUpdate = (e: Event) => {
      const ids = (e as CustomEvent<string[]>).detail ?? getCompareIds();
      setItems(ids);
      setVisible(ids.length >= 2);
    };

    window.addEventListener('compareUpdate', handleUpdate);
    return () => window.removeEventListener('compareUpdate', handleUpdate);
  }, []);

  const compareUrl = `/comparer?ids=${items.join(',')}`;

  return (
    <div
      className={[
        'fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
      aria-hidden={!visible}
    >
      <div className="max-w-[1440px] mx-auto px-4 pb-4">
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4">
          {/* Icon */}
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <Scale className="h-4 w-4 text-primary-600" />
          </div>

          {/* Selected count */}
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-semibold text-neutral-900">
              {items.length} bien{items.length > 1 ? 's' : ''} sélectionné{items.length > 1 ? 's' : ''}
            </p>
            <p className="text-caption text-neutral-500 truncate">
              {items.length < 2
                ? 'Sélectionnez au moins 2 biens pour comparer'
                : `IDs: ${items.join(', ')}`}
            </p>
          </div>

          {/* Compare CTA */}
          {items.length >= 2 && (
            <Link
              href={compareUrl}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-body-sm font-medium rounded-full transition-colors"
            >
              <Scale className="h-4 w-4" />
              Comparer ({items.length} biens)
            </Link>
          )}

          {/* Clear */}
          <button
            onClick={clearCompareIds}
            aria-label="Effacer la sélection"
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

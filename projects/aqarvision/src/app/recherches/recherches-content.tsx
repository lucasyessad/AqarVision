'use client';

import { useTransition } from 'react';
import { Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { clearSearchHistory } from '@/lib/actions/search-history';
import type { SearchHistory } from '@/types/database';

interface RecherchesContentProps {
  history: SearchHistory[];
}

export function RecherchesContent({ history }: RecherchesContentProps) {
  const [isPending, startTransition] = useTransition();

  const handleClear = () => {
    startTransition(async () => {
      await clearSearchHistory();
    });
  };

  const buildSearchUrl = (entry: SearchHistory) => {
    const params = new URLSearchParams();
    if (entry.query_text) params.set('q', entry.query_text);
    if (entry.filters && typeof entry.filters === 'object') {
      const filters = entry.filters as Record<string, string>;
      for (const [key, value] of Object.entries(filters)) {
        if (value && key !== 'page' && key !== 'sort') {
          params.set(key, String(value));
        }
      }
    }
    return `/recherche?${params.toString()}`;
  };

  return (
    <div className={isPending ? 'opacity-50' : ''}>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleClear}
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
          Effacer l&apos;historique
        </button>
      </div>

      <div className="space-y-2">
        {history.map((entry) => (
          <Link
            key={entry.id}
            href={buildSearchUrl(entry)}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {entry.query_text || 'Recherche avec filtres'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(entry.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

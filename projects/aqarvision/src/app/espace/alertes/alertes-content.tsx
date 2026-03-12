'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SavedSearchCard } from '@/components/search/saved-search-card';
import { deleteSavedSearch, toggleSearchAlert } from '@/lib/actions/search';
import type { SavedSearch, SearchAlert } from '@/types/database';

interface AlertesContentProps {
  savedSearches: SavedSearch[];
  alerts: SearchAlert[];
}

export function AlertesContent({ savedSearches, alerts }: AlertesContentProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const alertsBySearch = new Map(
    alerts.map((a) => [a.saved_search_id, a])
  );

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSavedSearch(id);
      router.refresh();
    });
  }

  function handleToggleAlert(alertId: string, isActive: boolean) {
    startTransition(async () => {
      await toggleSearchAlert(alertId, isActive);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {savedSearches.map((search) => (
        <SavedSearchCard
          key={search.id}
          search={search}
          alert={alertsBySearch.get(search.id) ?? null}
          onDelete={handleDelete}
          onToggleAlert={handleToggleAlert}
        />
      ))}
    </div>
  );
}

'use client';

import { useTransition } from 'react';
import { SavedSearchCard } from '@/components/search/saved-search-card';
import { deleteSavedSearch, toggleSearchAlert } from '@/lib/actions/search';
import type { SavedSearch, SearchAlert } from '@/types/database';

interface AlertesContentProps {
  savedSearches: SavedSearch[];
  alertsBySearch: Record<string, SearchAlert>;
}

export function AlertesContent({ savedSearches, alertsBySearch }: AlertesContentProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteSavedSearch(id);
    });
  };

  const handleToggleAlert = (alertId: string, isActive: boolean) => {
    startTransition(async () => {
      await toggleSearchAlert(alertId, isActive);
    });
  };

  return (
    <div className={`space-y-4 ${isPending ? 'opacity-50' : ''}`}>
      {savedSearches.map((search) => (
        <SavedSearchCard
          key={search.id}
          search={search}
          alert={alertsBySearch[search.id] || null}
          onDelete={handleDelete}
          onToggleAlert={handleToggleAlert}
        />
      ))}
    </div>
  );
}

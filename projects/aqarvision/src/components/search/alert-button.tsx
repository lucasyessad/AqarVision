'use client';

import { Bell, BellOff } from 'lucide-react';
import { useTransition, useState } from 'react';
import { createSavedSearch, createSearchAlert } from '@/lib/actions/search';
import { useSearchParams } from 'next/navigation';

interface AlertButtonProps {
  isAuthenticated: boolean;
}

export function AlertButton({ isAuthenticated }: AlertButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [created, setCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const handleClick = () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    startTransition(async () => {
      setError(null);

      // Build filters from search params
      const filters: Record<string, unknown> = {};
      const filterKeys = ['transaction_type', 'country', 'wilaya', 'commune', 'city', 'property_type', 'price_min', 'price_max', 'surface_min', 'surface_max', 'rooms_min'];
      for (const key of filterKeys) {
        const val = searchParams.get(key);
        if (val) filters[key] = val;
      }

      const q = searchParams.get('q');
      const name = q || 'Recherche du ' + new Date().toLocaleDateString('fr-FR');

      const saveResult = await createSavedSearch({ name, keywords: q, ...filters });
      if (!saveResult.success) {
        setError(saveResult.error || 'Erreur');
        return;
      }

      setCreated(true);
    });
  };

  if (created) {
    return (
      <button
        disabled
        className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
      >
        <Bell className="h-4 w-4" />
        Alerte créée
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 ${isPending ? 'opacity-50' : ''}`}
      >
        {isPending ? (
          <BellOff className="h-4 w-4 animate-pulse" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        Créer une alerte
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

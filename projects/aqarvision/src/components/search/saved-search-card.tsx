import Link from 'next/link';
import { Search, Bell, BellOff, Trash2 } from 'lucide-react';
import type { SavedSearch, SearchAlert } from '@/types/database';

interface SavedSearchCardProps {
  search: SavedSearch;
  alert?: SearchAlert | null;
  onDelete: (id: string) => void;
  onToggleAlert?: (alertId: string, isActive: boolean) => void;
}

export function SavedSearchCard({ search, alert, onDelete, onToggleAlert }: SavedSearchCardProps) {
  // Build a summary of the filters
  const filterParts: string[] = [];
  if (search.transaction_type) filterParts.push(search.transaction_type === 'sale' ? 'Vente' : 'Location');
  if (search.wilaya) filterParts.push(search.wilaya);
  if (search.commune) filterParts.push(search.commune);
  if (search.property_type) filterParts.push(search.property_type);
  if (search.price_min || search.price_max) {
    const min = search.price_min ? `${search.price_min.toLocaleString()}` : '0';
    const max = search.price_max ? `${search.price_max.toLocaleString()}` : '+';
    filterParts.push(`${min} - ${max} DA`);
  }

  // Build search URL to re-launch
  const params = new URLSearchParams();
  if (search.keywords) params.set('q', search.keywords);
  if (search.transaction_type) params.set('transaction_type', search.transaction_type);
  if (search.country) params.set('country', search.country);
  if (search.wilaya) params.set('wilaya', search.wilaya);
  if (search.commune) params.set('commune', search.commune);
  if (search.property_type) params.set('property_type', search.property_type);
  if (search.price_min) params.set('price_min', String(search.price_min));
  if (search.price_max) params.set('price_max', String(search.price_max));
  if (search.surface_min) params.set('surface_min', String(search.surface_min));
  if (search.surface_max) params.set('surface_max', String(search.surface_max));
  if (search.rooms_min) params.set('rooms_min', String(search.rooms_min));
  const searchUrl = `/recherche?${params.toString()}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{search.name}</h3>
          {filterParts.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">{filterParts.join(' · ')}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            {new Date(search.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Alert toggle */}
          {alert && onToggleAlert && (
            <button
              onClick={() => onToggleAlert(alert.id, !alert.is_active)}
              className={`rounded-lg p-2 ${
                alert.is_active
                  ? 'text-blue-600 hover:bg-blue-50'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={alert.is_active ? 'Désactiver l\'alerte' : 'Activer l\'alerte'}
            >
              {alert.is_active ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </button>
          )}
          {/* Delete */}
          <button
            onClick={() => onDelete(search.id)}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Re-launch link */}
      <Link
        href={searchUrl}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <Search className="h-3.5 w-3.5" />
        Relancer cette recherche
      </Link>
    </div>
  );
}

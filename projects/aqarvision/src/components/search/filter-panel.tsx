'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { COUNTRIES } from '@/config';

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Terrain' },
  { value: 'office', label: 'Bureau' },
  { value: 'warehouse', label: 'Entrepôt' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'surface_asc', label: 'Surface croissante' },
  { value: 'surface_desc', label: 'Surface décroissante' },
  { value: 'trust_desc', label: 'Confiance' },
];

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentFilters = {
    country: searchParams.get('country') || '',
    wilaya: searchParams.get('wilaya') || '',
    commune: searchParams.get('commune') || '',
    property_type: searchParams.get('property_type') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    surface_min: searchParams.get('surface_min') || '',
    surface_max: searchParams.get('surface_max') || '',
    rooms_min: searchParams.get('rooms_min') || '',
    sort: searchParams.get('sort') || 'recent',
  };

  const activeFilterCount = Object.entries(currentFilters).filter(
    ([key, val]) => val && key !== 'sort'
  ).length;

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/recherche?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    const transaction = searchParams.get('transaction_type');
    if (q) params.set('q', q);
    if (transaction) params.set('transaction_type', transaction);
    params.set('page', '1');
    router.push(`/recherche?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Toggle + Sort */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
              Effacer
            </button>
          )}
          <select
            value={currentFilters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter panel */}
      {isOpen && (
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-5">
          {/* Country */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Pays</label>
            <select
              value={currentFilters.country}
              onChange={(e) => updateFilter('country', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              {Object.values(COUNTRIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Wilaya */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Wilaya</label>
            <input
              type="text"
              value={currentFilters.wilaya}
              onChange={(e) => updateFilter('wilaya', e.target.value)}
              placeholder="Ex: Alger"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Type de bien</label>
            <select
              value={currentFilters.property_type}
              onChange={(e) => updateFilter('property_type', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price min */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Budget min</label>
            <input
              type="number"
              value={currentFilters.price_min}
              onChange={(e) => updateFilter('price_min', e.target.value)}
              placeholder="0"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Price max */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Budget max</label>
            <input
              type="number"
              value={currentFilters.price_max}
              onChange={(e) => updateFilter('price_max', e.target.value)}
              placeholder="Illimité"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Surface min */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Surface min (m²)</label>
            <input
              type="number"
              value={currentFilters.surface_min}
              onChange={(e) => updateFilter('surface_min', e.target.value)}
              placeholder="0"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Surface max */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Surface max (m²)</label>
            <input
              type="number"
              value={currentFilters.surface_max}
              onChange={(e) => updateFilter('surface_max', e.target.value)}
              placeholder="Illimité"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Rooms min */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Pièces min</label>
            <input
              type="number"
              value={currentFilters.rooms_min}
              onChange={(e) => updateFilter('rooms_min', e.target.value)}
              placeholder="0"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Commune */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Commune</label>
            <input
              type="text"
              value={currentFilters.commune}
              onChange={(e) => updateFilter('commune', e.target.value)}
              placeholder="Ex: Bab El Oued"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

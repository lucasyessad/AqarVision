'use client';

import { LayoutGrid, Map } from 'lucide-react';

export type ViewMode = 'list' | 'map';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors ${
          mode === 'list'
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700'
        }`}
        aria-pressed={mode === 'list'}
        aria-label="Vue liste"
      >
        <LayoutGrid className="h-4 w-4" />
        Liste
      </button>
      <button
        type="button"
        onClick={() => onChange('map')}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors ${
          mode === 'map'
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700'
        }`}
        aria-pressed={mode === 'map'}
        aria-label="Vue carte"
      >
        <Map className="h-4 w-4" />
        Carte
      </button>
    </div>
  );
}

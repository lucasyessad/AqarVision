'use client';

import { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';

const COMPARE_KEY = 'compare_ids';
const MAX_COMPARE = 4;

interface CompareButtonProps {
  propertyId: string;
  title: string;
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

function setCompareIds(ids: string[]) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('compareUpdate', { detail: ids }));
}

export function CompareButton({ propertyId, title }: CompareButtonProps) {
  const [selected, setSelected] = useState(false);
  const [atMax, setAtMax] = useState(false);

  useEffect(() => {
    const sync = () => {
      const ids = getCompareIds();
      setSelected(ids.includes(propertyId));
      setAtMax(ids.length >= MAX_COMPARE);
    };

    sync();

    const handleUpdate = () => sync();
    window.addEventListener('compareUpdate', handleUpdate);
    return () => window.removeEventListener('compareUpdate', handleUpdate);
  }, [propertyId]);

  const handleClick = () => {
    const ids = getCompareIds();

    if (ids.includes(propertyId)) {
      // Remove
      setCompareIds(ids.filter((id) => id !== propertyId));
    } else {
      if (ids.length >= MAX_COMPARE) return;
      setCompareIds([...ids, propertyId]);
    }
  };

  const isDisabled = !selected && atMax;

  if (isDisabled) {
    return (
      <div className="relative group">
        <button
          disabled
          aria-label="Maximum 4 biens"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
        >
          <Scale className="h-3.5 w-3.5" />
          Comparer
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          Maximum 4 biens
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={selected ? `Retirer ${title} de la comparaison` : `Ajouter ${title} à la comparaison`}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
        selected
          ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
          : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50',
      ].join(' ')}
    >
      <Scale className="h-3.5 w-3.5" />
      {selected ? 'Retirer' : 'Comparer'}
    </button>
  );
}

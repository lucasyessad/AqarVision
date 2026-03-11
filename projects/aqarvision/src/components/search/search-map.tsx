'use client';

import dynamic from 'next/dynamic';
import type { SearchPropertyResult } from '@/types/database';

const SearchMapInner = dynamic(() => import('./search-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-neutral-100 animate-pulse rounded-xl flex items-center justify-center">
      <p className="text-body-sm text-neutral-400">Chargement de la carte...</p>
    </div>
  ),
});

interface SearchMapProps {
  properties: SearchPropertyResult[];
  height?: string;
}

export function SearchMap({ properties, height }: SearchMapProps) {
  return <SearchMapInner properties={properties} height={height} />;
}

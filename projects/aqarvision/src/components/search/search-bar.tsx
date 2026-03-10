'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = 'Rechercher un bien immobilier...' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [transaction, setTransaction] = useState(searchParams.get('transaction_type') || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    if (transaction) {
      params.set('transaction_type', transaction);
    } else {
      params.delete('transaction_type');
    }
    params.set('page', '1');
    router.push(`/recherche?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      {/* Transaction toggle */}
      <div className="flex rounded-lg border border-gray-300 bg-white">
        <button
          type="button"
          onClick={() => setTransaction(transaction === 'sale' ? '' : 'sale')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            transaction === 'sale'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          } rounded-l-lg`}
        >
          Vente
        </button>
        <button
          type="button"
          onClick={() => setTransaction(transaction === 'rent' ? '' : 'rent')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            transaction === 'rent'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          } rounded-r-lg`}
        >
          Location
        </button>
      </div>

      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Rechercher
      </button>
    </form>
  );
}

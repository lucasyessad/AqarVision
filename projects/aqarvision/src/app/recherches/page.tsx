import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getSearchHistory } from '@/lib/queries/alerts';
import { RecherchesContent } from './recherches-content';
import { History } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Historique de recherche — AqarSearch',
};

export default async function RecherchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirectTo=/recherches');

  const history = await getSearchHistory(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Historique de recherche</h1>
          <p className="mt-1 text-sm text-gray-500">
            {history.length} recherche{history.length !== 1 ? 's' : ''} récente{history.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {history.length > 0 ? (
          <RecherchesContent history={history} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Aucun historique
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Vos recherches récentes apparaîtront ici.
            </p>
            <Link
              href="/recherche"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Lancer une recherche
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

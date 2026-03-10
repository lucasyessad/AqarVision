import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserSavedSearches, getUserAlerts } from '@/lib/queries/alerts';
import { AlertesContent } from './alertes-content';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mes alertes — AqarSearch',
};

export default async function AlertesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirectTo=/alertes');

  const [savedSearches, alerts] = await Promise.all([
    getUserSavedSearches(user.id),
    getUserAlerts(user.id),
  ]);

  // Map alerts by saved_search_id for quick lookup
  const alertsBySearch = new Map(
    alerts.map((a) => [a.saved_search_id, a])
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes alertes & recherches</h1>
          <p className="mt-1 text-sm text-gray-500">
            {savedSearches.length} recherche{savedSearches.length !== 1 ? 's' : ''} sauvegardée{savedSearches.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {savedSearches.length > 0 ? (
          <AlertesContent
            savedSearches={savedSearches}
            alertsBySearch={Object.fromEntries(alertsBySearch)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Aucune alerte
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Sauvegardez une recherche pour créer des alertes et être notifié des nouvelles annonces.
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

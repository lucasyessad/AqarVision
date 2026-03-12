import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSavedSearches, getUserAlerts } from "@/lib/queries/alerts";
import { AlertesContent } from "./alertes-content";

export default async function AlertesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [savedSearches, alerts] = await Promise.all([
    getUserSavedSearches(user.id),
    getUserAlerts(user.id),
  ]);

  if (savedSearches.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes alertes</h1>
        <div className="text-center py-16">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Aucune alerte configurée
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Sauvegardez une recherche et activez les alertes pour être notifié des nouvelles annonces.
          </p>
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-4 py-2 bg-bleu-nuit text-white text-sm font-medium rounded-lg hover:bg-bleu-nuit/90 transition-colors"
          >
            <Search className="h-4 w-4" />
            Lancer une recherche
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes alertes</h1>
        <span className="text-sm text-gray-500">
          {savedSearches.length} recherche{savedSearches.length > 1 ? "s" : ""} sauvegardée{savedSearches.length > 1 ? "s" : ""}
        </span>
      </div>
      <AlertesContent savedSearches={savedSearches} alerts={alerts} />
    </div>
  );
}

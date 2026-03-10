'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SEARCH } from '@/config';

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Enregistre une recherche dans l'historique.
 * Ne nécessite pas d'authentification (silencieux si non connecté).
 */
export async function trackSearch(
  queryText: string | null,
  filters: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: true }; // Silencieux si non connecté
  }

  // Limiter le nombre d'entrées
  const { count } = await supabase
    .from('search_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count || 0) >= SEARCH.HISTORY_MAX_ITEMS) {
    // Supprimer les plus anciennes
    const { data: oldest } = await supabase
      .from('search_history')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(10);

    if (oldest && oldest.length > 0) {
      await supabase
        .from('search_history')
        .delete()
        .in('id', oldest.map((o) => o.id));
    }
  }

  await supabase.from('search_history').insert({
    user_id: user.id,
    query_text: queryText,
    filters,
  });

  return { success: true };
}

/**
 * Supprime tout l'historique de recherche de l'utilisateur.
 */
export async function clearSearchHistory(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Vous devez être connecté.' };
  }

  const { error } = await supabase
    .from('search_history')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la suppression de l\'historique.' };
  }

  revalidatePath('/recherches');
  return { success: true };
}

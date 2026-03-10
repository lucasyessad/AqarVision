'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SEARCH } from '@/config';

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createSavedSearch(
  data: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Vous devez être connecté.' };
  }

  // Check limit
  const { count } = await supabase
    .from('saved_searches')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count || 0) >= SEARCH.MAX_SAVED_SEARCHES) {
    return { success: false, error: `Limite de ${SEARCH.MAX_SAVED_SEARCHES} recherches sauvegardées atteinte.` };
  }

  const { error } = await supabase.from('saved_searches').insert({
    user_id: user.id,
    name: data.name,
    transaction_type: data.transaction_type || null,
    country: data.country || null,
    wilaya: data.wilaya || null,
    commune: data.commune || null,
    city: data.city || null,
    property_type: data.property_type || null,
    price_min: data.price_min || null,
    price_max: data.price_max || null,
    surface_min: data.surface_min || null,
    surface_max: data.surface_max || null,
    rooms_min: data.rooms_min || null,
    keywords: data.keywords || null,
  });

  if (error) {
    return { success: false, error: 'Erreur lors de la sauvegarde.' };
  }

  revalidatePath('/alertes');
  return { success: true };
}

export async function deleteSavedSearch(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Vous devez être connecté.' };
  }

  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la suppression.' };
  }

  revalidatePath('/alertes');
  return { success: true };
}

export async function createSearchAlert(
  savedSearchId: string,
  channel: string = 'in_app',
  frequency: string = 'daily'
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Vous devez être connecté.' };
  }

  const { count } = await supabase
    .from('search_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count || 0) >= SEARCH.MAX_ALERTS) {
    return { success: false, error: `Limite de ${SEARCH.MAX_ALERTS} alertes atteinte.` };
  }

  const { error } = await supabase.from('search_alerts').insert({
    saved_search_id: savedSearchId,
    user_id: user.id,
    channel,
    frequency,
  });

  if (error) {
    return { success: false, error: 'Erreur lors de la création de l\'alerte.' };
  }

  revalidatePath('/alertes');
  return { success: true };
}

export async function toggleSearchAlert(
  alertId: string,
  isActive: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Vous devez être connecté.' };
  }

  const { error } = await supabase
    .from('search_alerts')
    .update({ is_active: isActive })
    .eq('id', alertId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour.' };
  }

  revalidatePath('/alertes');
  return { success: true };
}

export async function deleteSearchAlert(alertId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Vous devez être connecté.' };
  }

  const { error } = await supabase
    .from('search_alerts')
    .delete()
    .eq('id', alertId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la suppression.' };
  }

  revalidatePath('/alertes');
  return { success: true };
}

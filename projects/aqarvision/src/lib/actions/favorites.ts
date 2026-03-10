'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function addFavorite(propertyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Vous devez être connecté.' };
  }

  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    property_id: propertyId,
  });

  if (error) {
    if (error.code === '23505') {
      return { success: true }; // Already favorited
    }
    return { success: false, error: 'Erreur lors de l\'ajout.' };
  }

  revalidatePath('/favoris');
  return { success: true };
}

export async function removeFavorite(propertyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Vous devez être connecté.' };
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('property_id', propertyId);

  if (error) {
    return { success: false, error: 'Erreur lors de la suppression.' };
  }

  revalidatePath('/favoris');
  return { success: true };
}

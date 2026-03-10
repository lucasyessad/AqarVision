'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getAgencyForCurrentUser } from './auth';
import { isAuthError } from './auth-utils';

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function addLeadNote(
  leadId: string,
  content: string
): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  if (!content.trim()) {
    return { success: false, error: 'Le contenu ne peut pas être vide' };
  }

  const supabase = await createClient();

  // Vérifier que le lead appartient à l'agence
  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('id', leadId)
    .eq('agency_id', auth.agency.id)
    .single();

  if (!lead) {
    return { success: false, error: 'Lead introuvable' };
  }

  const { error } = await supabase.from('lead_notes').insert({
    lead_id: leadId,
    author_id: auth.user.id,
    content: content.trim(),
    created_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: 'Erreur lors de l\'ajout de la note' };
  }

  revalidatePath('/dashboard/leads');
  return { success: true };
}

export async function deleteLeadNote(noteId: string): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  const supabase = await createClient();

  const { error } = await supabase
    .from('lead_notes')
    .delete()
    .eq('id', noteId)
    .eq('author_id', auth.user.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la suppression' };
  }

  revalidatePath('/dashboard/leads');
  return { success: true };
}

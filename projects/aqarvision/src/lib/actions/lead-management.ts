'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getAgencyForCurrentUser } from './auth';
import { isAuthError } from './auth-utils';

interface ActionResult {
  success: boolean;
  error?: string;
}

const VALID_STATUSES = ['new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost'] as const;
const VALID_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

export async function updateLeadStatus(
  leadId: string,
  status: string
): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return { success: false, error: 'Statut invalide' };
  }

  const supabase = await createClient();

  const updateData: Record<string, string> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'contacted') {
    updateData.contacted_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('leads')
    .update(updateData)
    .eq('id', leadId)
    .eq('agency_id', auth.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }

  revalidatePath('/dashboard/leads');
  return { success: true };
}

export async function updateLeadPriority(
  leadId: string,
  priority: string
): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  if (!VALID_PRIORITIES.includes(priority as typeof VALID_PRIORITIES[number])) {
    return { success: false, error: 'Priorité invalide' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('leads')
    .update({
      priority,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId)
    .eq('agency_id', auth.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }

  revalidatePath('/dashboard/leads');
  return { success: true };
}

export async function deleteLead(leadId: string): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  const supabase = await createClient();

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)
    .eq('agency_id', auth.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la suppression' };
  }

  revalidatePath('/dashboard/leads');
  return { success: true };
}

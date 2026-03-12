'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { proPattern } from '@/lib/utils/paths';
import { getAgencyForCurrentUser } from './auth';
import { isAuthError } from './auth-utils';
import type { VisitRequestStatus } from '@/types/database';

interface ActionResult {
  success: boolean;
  error?: string;
}

const VALID_STATUSES: VisitRequestStatus[] = ['pending', 'confirmed', 'declined', 'completed'];

export async function updateVisitRequestStatus(
  requestId: string,
  status: string
): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  if (!VALID_STATUSES.includes(status as VisitRequestStatus)) {
    return { success: false, error: 'Statut invalide' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('visit_requests')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('agency_id', auth.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }

  revalidatePath(proPattern('visit-requests'));
  return { success: true };
}

export async function deleteVisitRequest(requestId: string): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  const supabase = await createClient();

  const { error } = await supabase
    .from('visit_requests')
    .delete()
    .eq('id', requestId)
    .eq('agency_id', auth.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la suppression' };
  }

  revalidatePath(proPattern('visit-requests'));
  return { success: true };
}

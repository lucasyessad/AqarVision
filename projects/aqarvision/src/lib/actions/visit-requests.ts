'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { proPattern } from '@/lib/utils/paths';
import { visitRequestSchema } from '@/lib/validators/visit-request';

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Create a visit request for a property.
 * Also creates a lead with source 'visit_request'.
 */
export async function createVisitRequest(data: {
  property_id: string;
  agency_id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const result = visitRequestSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message };
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Create visit request
  const { error: visitError } = await supabase
    .from('visit_requests')
    .insert({
      property_id: result.data.property_id,
      agency_id: result.data.agency_id,
      user_id: user?.id ?? null,
      name: result.data.name,
      phone: result.data.phone,
      email: result.data.email || null,
      message: result.data.message || null,
    });

  if (visitError) {
    return { success: false, error: 'Erreur lors de la demande de visite.' };
  }

  // Also create a lead (non-blocking)
  await supabase.from('leads').insert({
    agency_id: result.data.agency_id,
    property_id: result.data.property_id,
    name: result.data.name,
    phone: result.data.phone,
    email: result.data.email || null,
    message: result.data.message ? `[Demande de visite] ${result.data.message}` : '[Demande de visite]',
    source: 'aqarsearch',
    status: 'new',
    priority: 'normal',
  });

  revalidatePath(proPattern('visit-requests'));
  return { success: true };
}

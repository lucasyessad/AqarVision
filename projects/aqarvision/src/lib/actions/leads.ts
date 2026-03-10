'use server';

import { createClient } from '@/lib/supabase/server';
import { leadSchema } from '@/lib/validators/lead';

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createLead(formData: Record<string, unknown>): Promise<ActionResult> {
  const result = leadSchema.safeParse(formData);

  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || 'Données invalides' };
  }

  const supabase = await createClient();

  const { error } = await supabase.from('leads').insert({
    ...result.data,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: 'Erreur lors de l\'envoi du message' };
  }

  return { success: true };
}

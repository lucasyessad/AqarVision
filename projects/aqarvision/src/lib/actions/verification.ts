'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface VerificationStatus {
  verification_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  is_verified: boolean;
  verified_at: string | null;
  verification_note: string | null;
}

interface ActionResult {
  success?: boolean;
  error?: string;
  status?: VerificationStatus;
}

export async function getVerificationStatus(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  const { data: agency, error } = await supabase
    .from('agencies')
    .select('verification_status, is_verified, verified_at, verification_note')
    .eq('owner_id', user.id)
    .single();

  if (error || !agency) return { error: 'Agence introuvable' };

  return { status: agency as VerificationStatus };
}

export async function submitVerification(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('id, verification_status')
    .eq('owner_id', user.id)
    .single();

  if (agencyError || !agency) return { error: 'Agence non trouvée' };

  // Prevent re-submission if already verified
  if (agency.verification_status === 'verified') {
    return { error: 'Votre agence est déjà vérifiée' };
  }

  const rcFile = formData.get('registre_commerce') as File | null;
  const idFile = formData.get('id_document') as File | null;

  let rcUrl: string | null = null;
  let idUrl: string | null = null;

  if (rcFile && rcFile.size > 0) {
    const { data: uploaded, error: uploadError } = await supabase.storage
      .from('public')
      .upload(`${agency.id}/verification/registre_commerce_${Date.now()}`, rcFile, {
        upsert: true,
      });

    if (uploadError) return { error: 'Erreur lors de l\'upload du registre de commerce' };

    if (uploaded) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('public').getPublicUrl(uploaded.path);
      rcUrl = publicUrl;
    }
  }

  if (idFile && idFile.size > 0) {
    const { data: uploaded, error: uploadError } = await supabase.storage
      .from('public')
      .upload(`${agency.id}/verification/id_document_${Date.now()}`, idFile, {
        upsert: true,
      });

    if (uploadError) return { error: 'Erreur lors de l\'upload du document d\'identité' };

    if (uploaded) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('public').getPublicUrl(uploaded.path);
      idUrl = publicUrl;
    }
  }

  const updates: Record<string, unknown> = {
    verification_status: 'submitted',
    updated_at: new Date().toISOString(),
  };
  if (rcUrl) updates.registre_commerce_url = rcUrl;
  if (idUrl) updates.id_document_url = idUrl;

  const { error: updateError } = await supabase
    .from('agencies')
    .update(updates)
    .eq('id', agency.id);

  if (updateError) return { error: 'Erreur lors de l\'envoi de la demande' };

  revalidatePath('/dashboard/verification');
  return { success: true };
}

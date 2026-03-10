'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { leadSchema } from '@/lib/validators/lead';
import { RATE_LIMIT } from '@/config';

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Rate limiting en mémoire simple.
 * En production, utiliser Redis ou Supabase Edge Functions avec un rate limiter.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT.WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT.MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Nettoyage périodique des entrées expirées (éviter fuite mémoire)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetAt) rateLimitMap.delete(key);
    }
  }, RATE_LIMIT.WINDOW_MS);
}

export async function createLead(formData: Record<string, unknown>): Promise<ActionResult> {
  // Rate limiting par IP
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(`lead:${ip}`)) {
    return { success: false, error: 'Trop de requêtes. Veuillez réessayer dans une minute.' };
  }

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

'use server';

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getPlanConfig } from '@/config';

const inputSchema = z.object({
  title: z.string().optional(),
  type: z.string(),
  transaction_type: z.enum(['sale', 'rent']),
  surface: z.number().optional(),
  rooms: z.number().optional(),
  bathrooms: z.number().optional(),
  wilaya: z.string().optional(),
  commune: z.string().optional(),
  features: z.array(z.string()).optional(),
  price: z.number().optional(),
});

type GenerateInput = z.infer<typeof inputSchema>;

interface GenerateResult {
  title?: string;
  description?: string;
  error?: string;
}

export async function generatePropertyDescription(
  rawInput: GenerateInput
): Promise<GenerateResult> {
  // 1. Auth check
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Vous devez être connecté pour utiliser cette fonctionnalité.' };
  }

  // 2. Get agency and plan
  let activePlan: string | null = null;

  const { data: ownedAgency } = await supabase
    .from('agencies')
    .select('id, active_plan')
    .eq('owner_id', user.id)
    .single();

  if (ownedAgency) {
    activePlan = ownedAgency.active_plan;
  } else {
    const { data: membership } = await supabase
      .from('agency_members')
      .select('agency_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (membership) {
      const { data: memberAgency } = await supabase
        .from('agencies')
        .select('active_plan')
        .eq('id', membership.agency_id)
        .single();

      activePlan = memberAgency?.active_plan ?? null;
    }
  }

  if (!activePlan) {
    return { error: 'Agence introuvable.' };
  }

  // 3. Plan gate — require pro or enterprise
  if (activePlan !== 'pro' && activePlan !== 'enterprise') {
    return {
      error: 'Fonctionnalité réservée aux plans Pro et Enterprise.',
    };
  }

  // 4. Validate input
  const validated = inputSchema.safeParse(rawInput);
  if (!validated.success) {
    return { error: 'Données invalides: ' + validated.error.errors[0]?.message };
  }

  const input = validated.data;

  // 5. Call Anthropic API
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `Tu es un expert en immobilier algérien. Génère un titre accrocheur (max 80 caractères) et une description professionnelle (150-300 mots) pour ce bien immobilier.

Données du bien:
- Type: ${input.type}
- Transaction: ${input.transaction_type === 'sale' ? 'Vente' : 'Location'}
${input.surface ? `- Surface: ${input.surface} m²` : ''}
${input.rooms ? `- Pièces: ${input.rooms}` : ''}
${input.bathrooms ? `- Salles de bain: ${input.bathrooms}` : ''}
${input.wilaya ? `- Wilaya: ${input.wilaya}` : ''}
${input.commune ? `- Commune: ${input.commune}` : ''}
${input.price ? `- Prix: ${input.price.toLocaleString('fr-FR')} DZD` : ''}
${input.features?.length ? `- Équipements: ${input.features.join(', ')}` : ''}

Réponds en JSON avec ce format exact:
{"title": "...", "description": "..."}

Le ton doit être professionnel et vendeur, avec la terminologie immobilière algérienne (villa, appartement, duplex, F3, etc).`,
        },
      ],
    });

    // 6. Parse response
    const rawText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('');

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { error: 'Réponse invalide de l\'IA. Veuillez réessayer.' };
    }

    const parsed = JSON.parse(jsonMatch[0]) as { title?: string; description?: string };

    if (!parsed.title || !parsed.description) {
      return { error: 'Réponse incomplète de l\'IA. Veuillez réessayer.' };
    }

    return {
      title: parsed.title,
      description: parsed.description,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { error: `Erreur lors de la génération: ${message}` };
  }
}

"use server"

/**
 * createLeadFromChatbot
 *
 * Server Action that persists a chatbot lead collected by ChatbotWidget.
 * Data is stored in `chatbot_leads` — an open-insert table that accepts
 * anonymous visitors (no authenticated user required).
 *
 * Schema validated with Zod before any DB write.
 * Returns ActionResult<{ id: string }>.
 */

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/features/marketplace/types/search.types'

// ── Input schema ──────────────────────────────────────────────────────────────

const ChatbotLeadSchema = z.object({
  agency_id: z.string().uuid('agency_id must be a valid UUID'),
  property_type: z.string().max(100).optional(),
  budget: z.string().max(200).optional(),
  wilaya: z.string().max(100).optional(),
  contact_name: z.string().min(1, 'Le nom est requis').max(200),
  contact_phone: z
    .string()
    .regex(/^[\d\s+\-().]{7,20}$/, 'Numéro de téléphone invalide')
    .optional(),
  contact_email: z.string().email('Email invalide').optional(),
})

export type ChatbotLeadInput = z.infer<typeof ChatbotLeadSchema>

// ── Action ────────────────────────────────────────────────────────────────────

export async function createLeadFromChatbot(
  input: ChatbotLeadInput
): Promise<ActionResult<{ id: string }>> {
  // 1. Validate
  const parsed = ChatbotLeadSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parsed.error.errors.map((e) => e.message).join(', '),
      },
    }
  }

  // 2. At least one contact method required
  const { contact_phone, contact_email, contact_name } = parsed.data
  if (!contact_phone && !contact_email) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Un numéro de téléphone ou un email est requis.',
      },
    }
  }

  // 3. Resolve optional authenticated user
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Insert into chatbot_leads (RLS allows anonymous inserts)
  const { data, error } = await supabase
    .from('chatbot_leads')
    .insert({
      agency_id: parsed.data.agency_id,
      property_type: parsed.data.property_type ?? null,
      budget: parsed.data.budget ?? null,
      wilaya: parsed.data.wilaya ?? null,
      contact_name,
      contact_phone: contact_phone ?? null,
      contact_email: contact_email ?? null,
      user_id: user?.id ?? null,
      source: 'chatbot',
      status: 'new',
    })
    .select('id')
    .single()

  if (error) {
    return {
      success: false,
      error: {
        code: 'DB_ERROR',
        message: error.message,
      },
    }
  }

  return { success: true, data: { id: data.id as string } }
}

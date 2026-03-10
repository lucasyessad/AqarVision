import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase } from './helpers/mock-supabase';

// ─── Mock Supabase + headers ────────────────────────────────────────

const { supabase: mockSupabase, builder } = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Use a counter to generate unique IPs and avoid rate limiting
let ipCounter = 0;

vi.mock('next/headers', () => ({
  headers: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => `192.168.1.${++ipCounter}`),
    })
  ),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { createLead } from '@/lib/actions/leads';

// ─── Helpers ────────────────────────────────────────────────────────

const AGENCY_ID = '550e8400-e29b-41d4-a716-446655440000';

/** Mock the agency lookup + notification owner fetch that createLead now performs */
function mockAgencyFlow() {
  // 1. Agency existence check → .single()
  builder.single.mockResolvedValueOnce({
    data: { id: AGENCY_ID, active_plan: 'starter' },
    error: null,
  });
  // 2. Owner fetch for notification → .single()
  builder.single.mockResolvedValueOnce({
    data: { owner_id: 'owner-1' },
    error: null,
  });
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('createLead server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    builder.select.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    builder.gte.mockReturnValue(builder);
    builder.insert.mockReturnValue({ error: null });
  });

  const validLead = {
    agency_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Ahmed Benali',
    phone: '0555123456',
    source: 'contact_form',
  };

  it('creates a lead successfully', async () => {
    mockAgencyFlow();
    builder.insert.mockReturnValue({ error: null });
    const result = await createLead(validLead);
    expect(result.success).toBe(true);
  });

  it('rejects invalid data (short name)', async () => {
    const result = await createLead({ ...validLead, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid data (bad UUID)', async () => {
    const result = await createLead({ ...validLead, agency_id: 'not-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid data (short phone)', async () => {
    const result = await createLead({ ...validLead, phone: '12' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid source', async () => {
    const result = await createLead({ ...validLead, source: 'twitter_dm' });
    expect(result.success).toBe(false);
  });

  it('returns error when Supabase insert fails', async () => {
    // Agency exists but insert fails
    builder.single.mockResolvedValueOnce({
      data: { id: AGENCY_ID, active_plan: 'starter' },
      error: null,
    });
    builder.insert.mockReturnValue({ error: { message: 'DB error' } });

    const result = await createLead(validLead);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Erreur');
  });

  it('accepts lead with all optional fields', async () => {
    mockAgencyFlow();
    builder.insert.mockReturnValue({ error: null });

    const result = await createLead({
      ...validLead,
      email: 'ahmed@test.dz',
      message: 'Je suis intéressé par votre bien',
      property_id: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', async () => {
    const result = await createLead({ ...validLead, email: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid lead sources', async () => {
    const sources = ['contact_form', 'property_detail', 'whatsapp', 'phone', 'walk_in', 'referral'];

    for (const source of sources) {
      mockAgencyFlow();
      builder.insert.mockReturnValue({ error: null });
      const result = await createLead({ ...validLead, source });
      expect(result.success).toBe(true);
    }
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase } from './helpers/mock-supabase';

// ─── Mock Supabase ─────────────────────────────────────────────────

const { supabase: mockSupabase, builder } = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { createProperty, updateProperty, deleteProperty } from '@/lib/actions/properties';

// ─── Tests ──────────────────────────────────────────────────────────

describe('properties server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    builder.select.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    builder.insert.mockReturnValue(builder);
    builder.update.mockReturnValue(builder);
    builder.delete.mockReturnValue(builder);
    builder.single.mockResolvedValue({ data: null, error: null });
  });

  const validPropertyData = {
    title: 'Appartement F3 Alger',
    description: 'Bel appartement lumineux',
    price: 4500000,
    type: 'apartment',
    transaction_type: 'sale',
    status: 'draft',
    country: 'DZ',
    currency: 'DZD',
    images: [],
    features: ['Parking'],
    is_featured: false,
  };

  // ─── createProperty ──────────────────────────────────────────────

  describe('createProperty', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await createProperty(validPropertyData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('authentifié');
    });

    it('returns error when no agency found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValue({ data: null, error: null });

      const result = await createProperty(validPropertyData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('introuvable');
    });

    it('returns error for invalid data (short title)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: { id: 'agency-1', active_plan: 'starter' }, error: null });

      const result = await createProperty({ ...validPropertyData, title: 'AB' });
      expect(result.success).toBe(false);
    });

    it('returns error for invalid data (negative price)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: { id: 'agency-1', active_plan: 'starter' }, error: null });

      const result = await createProperty({ ...validPropertyData, price: -100 });
      expect(result.success).toBe(false);
    });

    it('returns error for invalid data (missing type)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: { id: 'agency-1', active_plan: 'starter' }, error: null });

      const result = await createProperty({ ...validPropertyData, type: '' });
      expect(result.success).toBe(false);
    });

    it('creates property successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single
        .mockResolvedValueOnce({ data: { id: 'agency-1', active_plan: 'starter' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'prop-new' }, error: null });

      const result = await createProperty(validPropertyData);
      expect(result.success).toBe(true);
      expect(result.id).toBe('prop-new');
    });

    it('returns error when Supabase insert fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single
        .mockResolvedValueOnce({ data: { id: 'agency-1', active_plan: 'starter' }, error: null })
        .mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

      const result = await createProperty(validPropertyData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Erreur');
    });
  });

  // ─── updateProperty ──────────────────────────────────────────────

  describe('updateProperty', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await updateProperty('prop-1', validPropertyData);
      expect(result.success).toBe(false);
    });

    it('returns error for invalid data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: { id: 'agency-1', active_plan: 'pro' }, error: null });

      const result = await updateProperty('prop-1', { ...validPropertyData, title: '' });
      expect(result.success).toBe(false);
    });

    it('updates property successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: { id: 'agency-1', active_plan: 'pro' }, error: null });

      const result = await updateProperty('prop-1', validPropertyData);
      expect(result.success).toBe(true);
    });
  });

  // ─── deleteProperty ──────────────────────────────────────────────

  describe('deleteProperty', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await deleteProperty('prop-1');
      expect(result.success).toBe(false);
    });

    it('deletes property successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: { id: 'agency-1', active_plan: 'starter' }, error: null });

      const result = await deleteProperty('prop-1');
      expect(result.success).toBe(true);
    });
  });
});

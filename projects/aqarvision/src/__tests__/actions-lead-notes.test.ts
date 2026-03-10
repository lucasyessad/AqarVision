import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase } from './helpers/mock-supabase';

const { supabase: mockSupabase, builder } = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { addLeadNote, deleteLeadNote } from '@/lib/actions/lead-notes';

describe('lead notes server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    builder.select.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    builder.in.mockReturnValue(builder);
    builder.insert.mockReturnValue(builder);
    builder.delete.mockReturnValue(builder);
    builder.single.mockResolvedValue({ data: null, error: null });
  });

  function mockAuth() {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'owner@test.dz' } },
      error: null,
    });
    builder.single.mockResolvedValueOnce({
      data: { id: 'agency-1', active_plan: 'pro' },
      error: null,
    });
  }

  // ─── addLeadNote ───────────────────────────────────────────────

  describe('addLeadNote', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not auth' },
      });
      const result = await addLeadNote('lead-1', 'test note');
      expect(result.success).toBe(false);
    });

    it('returns error for empty content', async () => {
      mockAuth();
      const result = await addLeadNote('lead-1', '   ');
      expect(result.success).toBe(false);
      expect(result.error).toContain('vide');
    });

    it('returns error when lead not found', async () => {
      mockAuth();
      // Lead ownership check returns null
      builder.single.mockResolvedValueOnce({ data: null, error: null });
      const result = await addLeadNote('lead-999', 'test note');
      expect(result.success).toBe(false);
      expect(result.error).toContain('introuvable');
    });

    it('adds note successfully', async () => {
      mockAuth();
      // Lead ownership check returns the lead
      builder.single.mockResolvedValueOnce({ data: { id: 'lead-1' }, error: null });
      const result = await addLeadNote('lead-1', 'This is a note');
      expect(result.success).toBe(true);
      expect(builder.insert).toHaveBeenCalled();
    });
  });

  // ─── deleteLeadNote ────────────────────────────────────────────

  describe('deleteLeadNote', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not auth' },
      });
      const result = await deleteLeadNote('note-1');
      expect(result.success).toBe(false);
    });

    it('deletes note successfully', async () => {
      mockAuth();
      const result = await deleteLeadNote('note-1');
      expect(result.success).toBe(true);
      expect(builder.delete).toHaveBeenCalled();
    });
  });
});

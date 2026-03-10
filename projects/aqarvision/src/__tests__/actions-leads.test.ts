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

import { updateLeadStatus, updateLeadPriority, deleteLead } from '@/lib/actions/lead-management';

// ─── Tests ──────────────────────────────────────────────────────────

describe('lead management server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    builder.select.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    builder.update.mockReturnValue(builder);
    builder.delete.mockReturnValue(builder);
    builder.single.mockResolvedValue({ data: null, error: null });
  });

  // ─── updateLeadStatus ─────────────────────────────────────────────

  describe('updateLeadStatus', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await updateLeadStatus('lead-1', 'contacted');
      expect(result.success).toBe(false);
      expect(result.error).toContain('authentifié');
    });

    it('returns error for invalid status', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: { id: 'agency-1' }, error: null });

      const result = await updateLeadStatus('lead-1', 'invalid_status');
      expect(result.success).toBe(false);
      expect(result.error).toContain('invalide');
    });

    it('accepts all valid status values', async () => {
      const validStatuses = ['new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost'];

      for (const status of validStatuses) {
        vi.clearAllMocks();
        builder.select.mockReturnValue(builder);
        builder.eq.mockReturnValue(builder);
        builder.update.mockReturnValue(builder);
        builder.single.mockResolvedValue({ data: null, error: null });

        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        });
        builder.single.mockResolvedValueOnce({ data: { id: 'agency-1' }, error: null });

        const result = await updateLeadStatus('lead-1', status);
        expect(result.success).toBe(true);
      }
    });

    it('updates status successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: { id: 'agency-1' }, error: null });

      const result = await updateLeadStatus('lead-1', 'qualified');
      expect(result.success).toBe(true);
    });
  });

  // ─── updateLeadPriority ───────────────────────────────────────────

  describe('updateLeadPriority', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await updateLeadPriority('lead-1', 'high');
      expect(result.success).toBe(false);
    });

    it('returns error for invalid priority', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: { id: 'agency-1' }, error: null });

      const result = await updateLeadPriority('lead-1', 'super_urgent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('invalide');
    });

    it('accepts all valid priority values', async () => {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];

      for (const priority of validPriorities) {
        vi.clearAllMocks();
        builder.select.mockReturnValue(builder);
        builder.eq.mockReturnValue(builder);
        builder.update.mockReturnValue(builder);
        builder.single.mockResolvedValue({ data: null, error: null });

        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        });
        builder.single.mockResolvedValueOnce({ data: { id: 'agency-1' }, error: null });

        const result = await updateLeadPriority('lead-1', priority);
        expect(result.success).toBe(true);
      }
    });
  });

  // ─── deleteLead ───────────────────────────────────────────────────

  describe('deleteLead', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await deleteLead('lead-1');
      expect(result.success).toBe(false);
    });

    it('returns error when no agency found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValue({ data: null, error: null });

      const result = await deleteLead('lead-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('introuvable');
    });

    it('deletes lead successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: { id: 'agency-1' }, error: null });

      const result = await deleteLead('lead-1');
      expect(result.success).toBe(true);
    });
  });
});

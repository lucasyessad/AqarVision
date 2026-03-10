import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase } from './helpers/mock-supabase';

// ─── Mock Supabase ─────────────────────────────────────────────────

const { supabase: mockSupabase, builder } = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import { updateAgencyBranding } from '@/lib/actions/branding';

// ─── Tests ──────────────────────────────────────────────────────────

describe('branding server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    builder.select.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    builder.update.mockReturnValue(builder);
    builder.single.mockResolvedValue({ data: null, error: null });
  });

  const validBranding = {
    name: 'Immobilière Alger',
    primary_color: '#2563eb',
    locale: 'fr',
  };

  // ─── Authentication checks ────────────────────────────────────────

  describe('updateAgencyBranding - auth', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await updateAgencyBranding('agency-1', validBranding);
      expect(result.success).toBe(false);
      expect(result.error).toContain('connecté');
    });

    it('returns error when agency not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      const result = await updateAgencyBranding('agency-1', validBranding);
      expect(result.success).toBe(false);
      expect(result.error).toContain('introuvable');
    });

    it('returns error when user is not owner or admin', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-other' } },
        error: null,
      });
      // Agency found but owner_id doesn't match
      builder.single
        .mockResolvedValueOnce({
          data: { active_plan: 'starter', owner_id: 'user-owner' },
          error: null,
        })
        // Member check - not an admin
        .mockResolvedValueOnce({ data: null, error: null });

      const result = await updateAgencyBranding('agency-1', validBranding);
      expect(result.success).toBe(false);
      expect(result.error).toContain('non autorisé');
    });
  });

  // ─── Validation checks ────────────────────────────────────────────

  describe('updateAgencyBranding - validation', () => {
    it('rejects invalid branding data (bad color)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({
        data: { active_plan: 'starter', owner_id: 'user-123' },
        error: null,
      });

      const result = await updateAgencyBranding('agency-1', {
        name: 'Test',
        primary_color: 'not-a-color',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short agency name', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({
        data: { active_plan: 'starter', owner_id: 'user-123' },
        error: null,
      });

      const result = await updateAgencyBranding('agency-1', {
        name: 'A',
        primary_color: '#000000',
      });
      expect(result.success).toBe(false);
    });

    it('updates branding successfully for owner', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({
        data: { active_plan: 'starter', owner_id: 'user-123' },
        error: null,
      });

      const result = await updateAgencyBranding('agency-1', validBranding);
      expect(result.success).toBe(true);
    });
  });

  // ─── Plan-based schema selection ──────────────────────────────────

  describe('updateAgencyBranding - plan detection', () => {
    it('uses luxury schema for enterprise plan', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({
        data: { active_plan: 'enterprise', owner_id: 'user-123' },
        error: null,
      });

      const result = await updateAgencyBranding('agency-1', {
        ...validBranding,
        hero_style: 'video',
        font_style: 'elegant',
        theme_mode: 'dark',
        tagline: 'Excellence immobilière',
      });
      expect(result.success).toBe(true);
    });

    it('uses basic schema for starter plan', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      builder.single.mockResolvedValueOnce({
        data: { active_plan: 'starter', owner_id: 'user-123' },
        error: null,
      });

      const result = await updateAgencyBranding('agency-1', validBranding);
      expect(result.success).toBe(true);
    });
  });
});

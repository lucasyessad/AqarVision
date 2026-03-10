import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase } from './helpers/mock-supabase';

const { supabase: mockSupabase, builder } = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import { getAgencyForCurrentUser } from '@/lib/actions/auth';
import { isAuthError } from '@/lib/actions/auth-utils';

describe('getAgencyForCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    builder.select.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    builder.in.mockReturnValue(builder);
    builder.single.mockResolvedValue({ data: null, error: null });
  });

  it('returns error when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const result = await getAgencyForCurrentUser();
    expect(isAuthError(result)).toBe(true);
    if (isAuthError(result)) {
      expect(result.error).toContain('authentifié');
    }
  });

  it('returns agency when user is owner', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@test.dz' } },
      error: null,
    });
    builder.single.mockResolvedValueOnce({
      data: { id: 'agency-1', active_plan: 'pro' },
      error: null,
    });

    const result = await getAgencyForCurrentUser();
    expect(isAuthError(result)).toBe(false);
    if (!isAuthError(result)) {
      expect(result.agency.id).toBe('agency-1');
      expect(result.agency.active_plan).toBe('pro');
      expect(result.user.id).toBe('user-123');
    }
  });

  it('returns error when user is not owner and not admin member', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-999', email: 'nobody@test.dz' } },
      error: null,
    });
    // No owned agency
    builder.single
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      // No admin membership
      .mockResolvedValueOnce({ data: null, error: null });

    const result = await getAgencyForCurrentUser();
    expect(isAuthError(result)).toBe(true);
    if (isAuthError(result)) {
      expect(result.error).toContain('introuvable');
    }
  });

  it('returns agency when user is admin member', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'member-123', email: 'admin@agency.dz' } },
      error: null,
    });
    // Not owner
    builder.single
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      // Admin member
      .mockResolvedValueOnce({ data: { agency_id: 'agency-2', role: 'admin' }, error: null })
      // Agency fetch
      .mockResolvedValueOnce({ data: { id: 'agency-2', active_plan: 'enterprise' }, error: null });

    const result = await getAgencyForCurrentUser();
    expect(isAuthError(result)).toBe(false);
    if (!isAuthError(result)) {
      expect(result.agency.id).toBe('agency-2');
      expect(result.agency.active_plan).toBe('enterprise');
    }
  });
});

describe('isAuthError', () => {
  it('returns true for error objects', () => {
    expect(isAuthError({ success: false, error: 'test' })).toBe(true);
  });

  it('returns false for valid auth', () => {
    expect(isAuthError({
      agency: { id: '1', active_plan: 'starter' },
      user: { id: '2', email: 'a@b.c' },
    })).toBe(false);
  });
});

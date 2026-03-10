import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabase } from './helpers/mock-supabase';

const { supabase: mockSupabase, builder } = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
} from '@/lib/actions/notifications';

describe('notification server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    builder.select.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    builder.insert.mockReturnValue(builder);
    builder.update.mockReturnValue(builder);
    builder.delete.mockReturnValue(builder);
    builder.single.mockResolvedValue({ data: null, error: null });
  });

  // ─── markNotificationAsRead ─────────────────────────────────────

  describe('markNotificationAsRead', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not auth' },
      });
      const result = await markNotificationAsRead('notif-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('authentifié');
    });

    it('marks notification as read successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      const result = await markNotificationAsRead('notif-1');
      expect(result.success).toBe(true);
      expect(builder.update).toHaveBeenCalled();
    });
  });

  // ─── markAllNotificationsAsRead ─────────────────────────────────

  describe('markAllNotificationsAsRead', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not auth' },
      });
      const result = await markAllNotificationsAsRead();
      expect(result.success).toBe(false);
    });

    it('marks all as read successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      const result = await markAllNotificationsAsRead();
      expect(result.success).toBe(true);
    });
  });

  // ─── deleteNotification ─────────────────────────────────────────

  describe('deleteNotification', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not auth' },
      });
      const result = await deleteNotification('notif-1');
      expect(result.success).toBe(false);
    });

    it('deletes notification successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      const result = await deleteNotification('notif-1');
      expect(result.success).toBe(true);
      expect(builder.delete).toHaveBeenCalled();
    });
  });

  // ─── createNotification ─────────────────────────────────────────

  describe('createNotification', () => {
    it('creates notification with all fields', async () => {
      await createNotification(
        'user-1',
        'new_lead',
        'Nouveau lead',
        'Message body',
        'agency-1',
        { leadName: 'Ahmed' }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
      expect(builder.insert).toHaveBeenCalled();
    });

    it('creates notification without optional fields', async () => {
      await createNotification('user-1', 'system', 'System alert');
      expect(builder.insert).toHaveBeenCalled();
    });
  });
});

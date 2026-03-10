import { vi } from 'vitest';

/**
 * Creates a chainable Supabase mock.
 * Every method returns `this` so chaining always works:
 * supabase.from('x').select('y').eq('a', 'b').single()
 */
export function createMockSupabase() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};

  // The chain object that every builder method returns
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    range: vi.fn(() => builder),
  };

  Object.assign(chain, builder);

  const supabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => builder),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        list: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  };

  return { supabase, builder };
}

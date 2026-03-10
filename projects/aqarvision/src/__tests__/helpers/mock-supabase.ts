import { vi } from 'vitest';

/**
 * Creates a chainable Supabase mock.
 * Every method returns `this` so chaining always works:
 * supabase.from('x').select('y').eq('a', 'b').single()
 */
export function createMockSupabase() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};

  // The chain object that every builder method returns
  const builder: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn((): any => builder),
    eq: vi.fn((): any => builder),
    neq: vi.fn((): any => builder),
    in: vi.fn((): any => builder),
    gte: vi.fn((): any => builder),
    lte: vi.fn((): any => builder),
    ilike: vi.fn((): any => builder),
    single: vi.fn((): any => Promise.resolve({ data: null, error: null })),
    insert: vi.fn((): any => builder),
    update: vi.fn((): any => builder),
    delete: vi.fn((): any => builder),
    order: vi.fn((): any => builder),
    limit: vi.fn((): any => builder),
    range: vi.fn((): any => builder),
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

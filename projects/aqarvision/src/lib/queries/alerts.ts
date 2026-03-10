import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { SavedSearch, SearchAlert, SearchHistory } from '@/types/database';

export const getUserSavedSearches = cache(
  async (userId: string): Promise<SavedSearch[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data || []) as SavedSearch[];
  }
);

export const getUserAlerts = cache(
  async (userId: string): Promise<SearchAlert[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from('search_alerts')
      .select('*')
      .eq('user_id', userId);
    return (data || []) as SearchAlert[];
  }
);

export const getSearchHistory = cache(
  async (userId: string): Promise<SearchHistory[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    return (data || []) as SearchHistory[];
  }
);

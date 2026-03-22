'use client';

/**
 * useCloudSources — fetches saved_research from Supabase + realtime sync
 *
 * Returns cloud-saved sources so the notebook page can display them.
 * Subscribes to INSERT events so extension saves appear without refresh.
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MOCK_USER_ID } from './mock-constants';

export interface CloudSource {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  abstract: string;
  trust_score: number;
  trust_factors: Record<string, unknown> | null;
  trust_reason: string;
  bias: Record<string, unknown> | null;
  saved_at: string;
  notebook_id: number;
}

interface UseCloudSourcesResult {
  sources: CloudSource[];
  loading: boolean;
  error: string | null;
}

export function useCloudSources(): UseCloudSourcesResult {
  const [sources, setSources] = useState<CloudSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    // Initial fetch
    async function fetchSources() {
      const { data, error: fetchError } = await supabase!
        .from('saved_research')
        .select('*')
        .eq('user_id', MOCK_USER_ID)
        .order('saved_at', { ascending: false });

      if (fetchError) {
        console.error('[useCloudSources] fetch error:', fetchError);
        setError(fetchError.message);
      } else {
        setSources((data as CloudSource[]) || []);
      }
      setLoading(false);
    }

    fetchSources();

    // Realtime subscription for INSERT events
    const channel = supabase
      .channel('saved_research_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'saved_research',
          filter: `user_id=eq.${MOCK_USER_ID}`,
        },
        (payload: any) => {
          const newRow = payload.new as CloudSource;
          setSources((prev) => {
            // Avoid duplicates
            if (prev.some((s) => s.id === newRow.id)) return prev;
            return [newRow, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { sources, loading, error };
}

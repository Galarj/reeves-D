/**
 * Supabase Action Helpers
 * ────────────────────────
 * Connects directly to the user's private data via their session.
 */

import { supabase } from './supabase-client';
import type { Source } from '../types';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Gets the current authenticated user and their active notebook.
 */
async function getActiveContext() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Find their first notebook to save research to
  const { data: nb } = await supabase
    .from('notebooks')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  // if nb doesn't exist, we could create one or fallback. We fallback to 1 as safety 
  const notebookId = nb ? nb.id : 1;
  return { userId: user.id, notebookId };
}

/**
 * Upsert a page or source into `saved_research` under the user's notebook.
 */
export async function saveToNotebook(
  payload: { url?: string; title: string; trust_score: string | number; summary?: string } | Source
): Promise<ActionResult> {
  try {
    const { notebookId } = await getActiveContext();

    // Dynamically map legacy Source objects or the raw string arguments
    const url = 'url' in payload && payload.url ? payload.url : ('doi' in payload && payload.doi ? `https://doi.org/${payload.doi}` : `id-${(payload as any).id || Date.now()}`);
    const title = payload.title;
    const trust_score = String(payload.trust_score);
    const summary = 'summary' in payload ? payload.summary : ('abstract' in payload ? payload.abstract : '');

    // 1. Soft upsert check (since 'url' isn't explicitly @unique in Prisma)
    const { data: existing } = await supabase
      .from('saved_research')
      .select('id')
      .eq('url', url)
      .eq('notebook_id', notebookId)
      .maybeSingle();

    const record = {
      notebook_id: notebookId,
      url,
      title,
      trust_score,
      summary,
      metadata: payload // dump the rest for safety
    };

    let opError;
    if (existing) {
      const { error } = await supabase.from('saved_research').update(record).eq('id', existing.id);
      opError = error;
    } else {
      const { error } = await supabase.from('saved_research').insert(record);
      opError = error;
    }

    if (opError) throw opError;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: message };
  }
}

/**
 * Insert a term into `glossary_terms`.
 */
export async function saveToGlossary(
  term: string,
  definition: string
): Promise<ActionResult> {
  try {
    const { userId } = await getActiveContext();

    const { error } = await supabase.from('glossary_terms').insert({
      user_id: userId,
      term,
      definition,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: message };
  }
}

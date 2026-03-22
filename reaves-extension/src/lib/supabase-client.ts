/**
 * Supabase Client — singleton for the extension sidebar
 * Uses VITE_ prefixed env vars (Vite exposes these to the client bundle).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[supabase-client] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY ?? ''
);

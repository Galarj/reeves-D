/**
 * Supabase Client — singleton for the extension sidebar
 * Uses VITE_ prefixed env vars (Vite exposes these to the client bundle).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fxmudyjgfheriatuqphw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4bXVkeWpnZmhlcmlhdHVxcGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDk5MjcsImV4cCI6MjA4OTcyNTkyN30.HmjTl1M8w2enApi2bs_QaTX1l0GgY1EV4bpFAtx5Huo';

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

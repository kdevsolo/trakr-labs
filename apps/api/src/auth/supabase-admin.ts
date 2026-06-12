import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) throw new Error('SUPABASE_URL is not set');
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');

    _client = createClient(url, key);
  }

  return _client;
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase client with service role key.
 * Use only in API routes / Server Actions; never expose to the client.
 */
export function getSupabaseServer() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Browser Supabase client with anon key.
 * Use only in client components (e.g. for Realtime subscriptions).
 * Returns null if NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.
 */
export function createSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "./env";

let cached: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service role key.
 *
 * Every write in this app goes through trusted server code (route handlers and
 * server components), so RLS is left locked down and the service role is the
 * only path in. Never import this from a client component.
 */
export function serviceClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!cached) {
    cached = createClient(env.supabaseUrl!, env.supabaseServiceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

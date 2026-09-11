import { createClient as createRawClient } from "@supabase/supabase-js";

/**
 * Service-role client for privileged, server-only operations (e.g. signed
 * upload/download URLs for the evidence bucket). NEVER import this from
 * client components and never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

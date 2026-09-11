import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/domain";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (profile as Profile) ?? null;
}

/** Server Component / Server Action guard: redirects to /login if unauthenticated. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

// Re-exported for convenience in Server Components/Actions. Client
// Components must import these directly from "@/lib/roles" instead — that
// module has no server-only dependencies, whereas importing them from here
// would pull next/headers into the browser bundle.
export { canEditContent, isAdmin, canReview, CONTENT_EDITOR_ROLES } from "@/lib/roles";

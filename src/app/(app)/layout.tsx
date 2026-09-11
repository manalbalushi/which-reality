import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("is_read", false);

  return (
    <AppShell profile={profile}>
      <Topbar profile={profile} unreadCount={count ?? 0} />
      <main className="scrollbar-thin flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
    </AppShell>
  );
}

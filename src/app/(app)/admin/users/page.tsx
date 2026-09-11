import { redirect } from "next/navigation";
import { requireProfile, isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionCard } from "@/components/ui/Card";
import { UsersTable } from "@/components/admin/UsersTable";
import type { Profile } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const profile = await requireProfile();
  if (!isAdmin(profile.role)) redirect("/dashboard");

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("full_name");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Users &amp; Roles</h1>
        <p className="text-sm text-slate-500">
          Manage role-based access. New accounts are provisioned via Supabase Authentication (see the Deployment guide);
          this page controls their role and active status once created.
        </p>
      </div>
      <SectionCard title={`${data?.length ?? 0} users`}>
        <UsersTable users={(data ?? []) as Profile[]} currentUserId={profile.id} />
      </SectionCard>
    </div>
  );
}

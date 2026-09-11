import { createClient } from "@/lib/supabase/server";
import { getReferenceData } from "@/lib/data/reference";
import { requireProfile, canEditContent } from "@/lib/auth";
import { SectionCard } from "@/components/ui/Card";
import { EvidenceList } from "@/components/evidence/EvidenceList";
import type { Evidence } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function EvidenceRepositoryPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const reference = await getReferenceData();

  const { data } = await supabase.from("evidence").select("*").eq("is_deleted", false).order("upload_date", { ascending: false });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Evidence Repository</h1>
        <p className="text-sm text-slate-500">
          Centralized, secure storage for all assessment, risk, control, action and participant-session evidence.
        </p>
      </div>
      <SectionCard title={`${data?.length ?? 0} evidence item${(data?.length ?? 0) === 1 ? "" : "s"}`}>
        <EvidenceList evidence={(data ?? []) as Evidence[]} profiles={reference.profiles} canManage={canEditContent(profile.role)} />
      </SectionCard>
    </div>
  );
}

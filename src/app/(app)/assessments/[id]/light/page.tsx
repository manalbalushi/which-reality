import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getReferenceData } from "@/lib/data/reference";
import { LightWizard } from "@/components/assessments/LightWizard";
import type { ActionItem, Risk } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function LightAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();
  const reference = await getReferenceData();

  const { data: assessment } = await supabase.from("assessments").select("*").eq("id", id).eq("is_deleted", false).single();
  if (!assessment) notFound();
  if (assessment.type !== "light") redirect(`/assessments/${id}/edit/info`);

  const { data: risks } = await supabase.from("risks").select("*").eq("assessment_id", id).eq("is_deleted", false).order("created_at");
  const riskIds = (risks ?? []).map((r) => r.id);
  const { data: actions } = riskIds.length
    ? await supabase.from("actions").select("*").in("risk_id", riskIds).eq("is_deleted", false)
    : { data: [] };

  return (
    <LightWizard
      profile={profile}
      assessment={assessment}
      risks={(risks ?? []) as Risk[]}
      actions={(actions ?? []) as ActionItem[]}
      reference={reference}
    />
  );
}

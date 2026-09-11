import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getReferenceData } from "@/lib/data/reference";
import { RiskDetail } from "@/components/risks/RiskDetail";
import type { ActionItem, AuditLog, Evidence, Risk, VRiskHistory } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function RiskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();
  const reference = await getReferenceData();

  const { data: risk } = await supabase.from("risks").select("*").eq("id", id).eq("is_deleted", false).single();
  if (!risk) notFound();

  const { data: assessment } = await supabase.from("assessments").select("*").eq("id", risk.assessment_id).single();

  const [{ data: actions }, { data: evidence }, { data: auditLogs }, { data: history }, { data: assessmentControls }, { data: riskControlLinks }] =
    await Promise.all([
      supabase.from("actions").select("*").eq("risk_id", id).eq("is_deleted", false).order("target_date"),
      supabase.from("evidence").select("*").eq("risk_id", id).eq("is_deleted", false),
      supabase.from("audit_logs").select("*").eq("object_id", id).order("occurred_at", { ascending: false }).limit(100),
      risk.lineage_key
        ? supabase.from("v_risk_history").select("*").eq("lineage_key", risk.lineage_key).order("assessment_year")
        : Promise.resolve({ data: [] }),
      supabase.from("assessment_controls").select("*").eq("assessment_id", risk.assessment_id),
      supabase.from("risk_controls").select("*").eq("risk_id", id),
    ]);

  return (
    <RiskDetail
      currentProfile={profile}
      risk={risk as Risk}
      assessment={assessment}
      actions={(actions ?? []) as ActionItem[]}
      evidence={(evidence ?? []) as Evidence[]}
      auditLogs={(auditLogs ?? []) as AuditLog[]}
      history={(history ?? []) as VRiskHistory[]}
      assessmentControls={assessmentControls ?? []}
      riskControlLinks={(riskControlLinks ?? []).map((l) => l.assessment_control_id)}
      reference={reference}
    />
  );
}

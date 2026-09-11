import { createClient } from "@/lib/supabase/server";
import type {
  ActionItem,
  Approval,
  Asset,
  AssessmentControl,
  AssessmentParticipant,
  AuditLog,
  Evidence,
  Risk,
} from "@/types/domain";
import type { ReferenceData } from "@/lib/data/reference";

export async function getAssessmentBundle(id: string, reference: ReferenceData) {
  const supabase = await createClient();

  const { data: assessment } = await supabase.from("assessments").select("*").eq("id", id).eq("is_deleted", false).single();
  if (!assessment) return null;

  const [
    { data: participants },
    { data: assessmentAssets },
    { data: risks },
    { data: assessmentControls },
    { data: riskControls },
    { data: actions },
    { data: evidenceDirect },
    { data: approvals },
    { data: otLevelLinks },
  ] = await Promise.all([
    supabase.from("assessment_participants").select("*").eq("assessment_id", id).order("created_at"),
    supabase.from("assessment_assets").select("asset_id").eq("assessment_id", id),
    supabase.from("risks").select("*").eq("assessment_id", id).eq("is_deleted", false).order("created_at"),
    supabase.from("assessment_controls").select("*").eq("assessment_id", id).order("created_at"),
    supabase.from("risk_controls").select("*"),
    supabase.from("actions").select("*").eq("assessment_id", id).eq("is_deleted", false).order("target_date"),
    supabase.from("evidence").select("*").eq("assessment_id", id).eq("is_deleted", false).order("upload_date", { ascending: false }),
    supabase.from("approvals").select("*").eq("assessment_id", id).order("created_at"),
    supabase.from("assessment_ot_levels").select("ot_level_id").eq("assessment_id", id),
  ]);

  const riskIds = (risks ?? []).map((r) => r.id);
  const actionIds = (actions ?? []).map((a) => a.id);
  const participantIds = (participants ?? []).map((p) => p.id);

  const [{ data: riskEvidence }, { data: actionEvidence }, { data: participantEvidence }, { data: auditLogs }] = await Promise.all([
    riskIds.length ? supabase.from("evidence").select("*").in("risk_id", riskIds).eq("is_deleted", false) : Promise.resolve({ data: [] }),
    actionIds.length ? supabase.from("evidence").select("*").in("action_id", actionIds).eq("is_deleted", false) : Promise.resolve({ data: [] }),
    participantIds.length ? supabase.from("evidence").select("*").in("participant_id", participantIds).eq("is_deleted", false) : Promise.resolve({ data: [] }),
    supabase
      .from("audit_logs")
      .select("*")
      .in("object_id", [id, ...riskIds, ...actionIds])
      .order("occurred_at", { ascending: false })
      .limit(200),
  ]);

  const evidenceMap = new Map<string, Evidence>();
  for (const e of [...(evidenceDirect ?? []), ...(riskEvidence ?? []), ...(actionEvidence ?? []), ...(participantEvidence ?? [])]) {
    evidenceMap.set(e.id, e as Evidence);
  }

  const assetIds = new Set((assessmentAssets ?? []).map((a) => a.asset_id));
  const linkedAssets = reference.assets.filter((a) => assetIds.has(a.id));

  return {
    assessment,
    participants: (participants ?? []) as AssessmentParticipant[],
    linkedAssets: linkedAssets as Asset[],
    risks: (risks ?? []) as Risk[],
    assessmentControls: (assessmentControls ?? []) as AssessmentControl[],
    riskControlLinks: (riskControls ?? []) as { risk_id: string; assessment_control_id: string }[],
    actions: (actions ?? []) as ActionItem[],
    evidence: [...evidenceMap.values()],
    approvals: (approvals ?? []) as Approval[],
    auditLogs: (auditLogs ?? []) as AuditLog[],
    selectedOtLevelIds: (otLevelLinks ?? []).map((l) => l.ot_level_id),
  };
}

export type AssessmentBundle = NonNullable<Awaited<ReturnType<typeof getAssessmentBundle>>>;

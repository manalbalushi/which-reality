"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ApplicabilityStatus,
  ControlEffectiveness,
  ImplementationStatus,
  ParticipationType,
  TreatmentOption,
} from "@/types/domain";

function err(message: string): never {
  throw new Error(message);
}

// ---------------------------------------------------------------------------
// Assessment lifecycle
// ---------------------------------------------------------------------------
export async function createDraftAssessment(type: "light" | "full") {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      title: type === "light" ? "Untitled Light Assessment" : "Untitled Full Assessment",
      type,
      status: "draft",
      assessment_owner_id: profile.id,
      created_by: profile.id,
      assessment_date: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();

  if (error || !data) err(error?.message ?? "Failed to create assessment");

  revalidatePath("/assessments");
  if (type === "light") {
    redirect(`/assessments/${data.id}/light`);
  }
  redirect(`/assessments/${data.id}/edit/info`);
}

export async function updateAssessmentFields(id: string, patch: Record<string, unknown>) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("assessments").update(patch).eq("id", id);
  if (error) err(error.message);
  revalidatePath(`/assessments/${id}`);
  revalidatePath(`/assessments/${id}/edit`, "layout");
}

export async function setAssessmentOtLevels(assessmentId: string, otLevelIds: string[]) {
  await requireProfile();
  const supabase = await createClient();
  await supabase.from("assessment_ot_levels").delete().eq("assessment_id", assessmentId);
  if (otLevelIds.length) {
    await supabase
      .from("assessment_ot_levels")
      .insert(otLevelIds.map((ot_level_id) => ({ assessment_id: assessmentId, ot_level_id })));
  }
  revalidatePath(`/assessments/${assessmentId}/edit/scope`);
}

export async function setAssessmentAssets(assessmentId: string, assetIds: string[]) {
  await requireProfile();
  const supabase = await createClient();
  await supabase.from("assessment_assets").delete().eq("assessment_id", assessmentId);
  if (assetIds.length) {
    await supabase.from("assessment_assets").insert(assetIds.map((asset_id) => ({ assessment_id: assessmentId, asset_id })));
  }
  revalidatePath(`/assessments/${assessmentId}/edit/assets`);
}

export async function deleteAssessment(id: string) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("assessments").update({ is_deleted: true }).eq("id", id);
  if (error) err(error.message);
  revalidatePath("/assessments");
  redirect("/assessments");
}

// ---------------------------------------------------------------------------
// Participants
// ---------------------------------------------------------------------------
export async function addParticipant(assessmentId: string, form: {
  name: string; job_title?: string; department?: string; organization?: string;
  role_in_assessment?: string; email?: string; participation_type: ParticipationType;
  date_participated?: string; comments?: string;
}) {
  await requireProfile();
  if (!form.name.trim()) err("Participant name is required.");
  const supabase = await createClient();
  const { error } = await supabase.from("assessment_participants").insert({ assessment_id: assessmentId, ...form });
  if (error) err(error.message);
  revalidatePath(`/assessments/${assessmentId}`, "layout");
}

export async function deleteParticipant(id: string, assessmentId: string) {
  await requireProfile();
  const supabase = await createClient();
  await supabase.from("assessment_participants").delete().eq("id", id);
  revalidatePath(`/assessments/${assessmentId}`, "layout");
}

// ---------------------------------------------------------------------------
// Risks
// ---------------------------------------------------------------------------
export interface RiskInput {
  title: string;
  cause?: string;
  event?: string;
  consequence_text?: string;
  category_id?: string;
  source?: string;
  threat?: string;
  vulnerability?: string;
  consequence?: string;
  affected_asset_id?: string;
  affected_process?: string;
  existing_controls_text?: string;
  owner_id?: string;
}

export async function addRisk(assessmentId: string, form: RiskInput) {
  await requireProfile();
  if (!form.title?.trim()) err("Risk title is required.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("risks")
    .insert({ assessment_id: assessmentId, ...form })
    .select("id")
    .single();
  if (error) err(error.message);
  revalidatePath(`/assessments/${assessmentId}`, "layout");
  return data!.id as string;
}

export async function updateRisk(id: string, assessmentId: string, patch: Record<string, unknown>) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("risks").update(patch).eq("id", id);
  if (error) err(error.message);
  revalidatePath(`/assessments/${assessmentId}`, "layout");
  revalidatePath(`/risks/${id}`);
}

export async function deleteRisk(id: string, assessmentId: string) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("risks").update({ is_deleted: true }).eq("id", id);
  if (error) err(error.message);
  revalidatePath(`/assessments/${assessmentId}`, "layout");
}

export async function updateRiskScoring(
  id: string,
  assessmentId: string,
  patch: {
    inherent_likelihood?: number | null;
    inherent_impact?: number | null;
    residual_likelihood?: number | null;
    residual_impact?: number | null;
    treatment?: TreatmentOption | null;
    acceptance_justification?: string | null;
    acceptance_authority?: string | null;
    acceptance_date?: string | null;
    avoidance_explanation?: string | null;
    transfer_method?: string | null;
  }
) {
  await requireProfile();
  if (patch.treatment === "accept" && (!patch.acceptance_justification || !patch.acceptance_authority)) {
    err("Risk acceptance requires a justification and an acceptance authority.");
  }
  const supabase = await createClient();
  const { error } = await supabase.from("risks").update(patch).eq("id", id);
  if (error) err(error.message);
  revalidatePath(`/assessments/${assessmentId}`, "layout");
}

// ---------------------------------------------------------------------------
// Applicability & Controls
// ---------------------------------------------------------------------------
export async function upsertAssessmentControl(
  assessmentId: string,
  form: {
    id?: string;
    control_id: string;
    applicability: ApplicabilityStatus;
    na_justification?: string;
    implementation_status: ImplementationStatus;
    control_owner_id?: string;
    evidence_available: boolean;
    evidence_reference?: string;
    effectiveness: ControlEffectiveness;
    comments?: string;
  }
) {
  await requireProfile();
  if (form.applicability === "not_applicable" && !form.na_justification?.trim()) {
    err("A justification is required when a control is marked Not Applicable.");
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("assessment_controls")
    .upsert({ assessment_id: assessmentId, ...form }, { onConflict: "assessment_id,control_id" });
  if (error) err(error.message);
  revalidatePath(`/assessments/${assessmentId}`, "layout");
}

export async function linkRiskControl(riskId: string, assessmentControlId: string, assessmentId: string) {
  await requireProfile();
  const supabase = await createClient();
  await supabase.from("risk_controls").upsert({ risk_id: riskId, assessment_control_id: assessmentControlId });
  revalidatePath(`/assessments/${assessmentId}`, "layout");
}

export async function unlinkRiskControl(riskId: string, assessmentControlId: string, assessmentId: string) {
  await requireProfile();
  const supabase = await createClient();
  await supabase.from("risk_controls").delete().eq("risk_id", riskId).eq("assessment_control_id", assessmentControlId);
  revalidatePath(`/assessments/${assessmentId}`, "layout");
}

// ---------------------------------------------------------------------------
// Actions (mitigation action register)
// ---------------------------------------------------------------------------
export interface ActionInput {
  description: string;
  owner_id: string;
  department_id?: string;
  priority: "critical" | "high" | "medium" | "low";
  target_date: string;
  status?: "open" | "in_progress" | "completed" | "cancelled" | "on_hold";
  completion_date?: string | null;
  comments?: string;
}

export async function addAction(riskId: string, assessmentId: string, form: ActionInput) {
  await requireProfile();
  if (!form.owner_id) err("An action owner is required.");
  if (!form.target_date) err("A target date is required.");
  const supabase = await createClient();
  const { error } = await supabase.from("actions").insert({ risk_id: riskId, assessment_id: assessmentId, ...form });
  if (error) err(error.message);
  revalidatePath(`/assessments/${assessmentId}`, "layout");
  revalidatePath("/actions");
}

export async function updateAction(id: string, patch: Partial<ActionInput>) {
  await requireProfile();
  if (patch.status === "completed" && !patch.completion_date) {
    err("A completion date is required to mark an action Completed.");
  }
  const supabase = await createClient();
  const { error } = await supabase.from("actions").update(patch).eq("id", id);
  if (error) err(error.message);
  revalidatePath("/actions");
  revalidatePath("/assessments", "layout");
}

export async function deleteAction(id: string) {
  await requireProfile();
  const supabase = await createClient();
  await supabase.from("actions").update({ is_deleted: true }).eq("id", id);
  revalidatePath("/actions");
}

export async function requestExtension(
  actionId: string,
  form: {
    current_target_date: string;
    requested_target_date: string;
    reason: string;
    risk_impact?: string;
    compensating_controls?: string;
    approval_authority?: string;
  }
) {
  const profile = await requireProfile();
  if (!form.reason.trim()) err("A reason is required to request an extension.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("action_extensions")
    .insert({ action_id: actionId, requested_by: profile.id, ...form });
  if (error) err(error.message);
  revalidatePath("/actions");
}

export async function decideExtension(id: string, decision: "approved" | "rejected", comments?: string) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: ext, error: fetchErr } = await supabase
    .from("action_extensions")
    .select("action_id, requested_target_date")
    .eq("id", id)
    .single();
  if (fetchErr || !ext) err("Extension request not found.");

  const { error } = await supabase
    .from("action_extensions")
    .update({ approval_status: decision, decided_by: profile.id, decided_at: new Date().toISOString(), decision_comments: comments })
    .eq("id", id);
  if (error) err(error.message);

  if (decision === "approved") {
    await supabase.from("actions").update({ target_date: ext.requested_target_date, status: "in_progress" }).eq("id", ext.action_id);
  }
  revalidatePath("/actions");
}

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------
export async function uploadEvidence(formData: FormData) {
  const profile = await requireProfile();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) err("Select a file to upload.");

  const assessmentId = (formData.get("assessment_id") as string) || null;
  const riskId = (formData.get("risk_id") as string) || null;
  const actionId = (formData.get("action_id") as string) || null;
  const participantId = (formData.get("participant_id") as string) || null;
  const evidenceType = (formData.get("evidence_type") as string) || "Document";
  const description = (formData.get("description") as string) || null;

  const supabase = await createClient();
  const path = `${assessmentId ?? "general"}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from("evidence").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) err(`Upload failed: ${uploadError.message}`);

  const { error } = await supabase.from("evidence").insert({
    file_name: file.name,
    storage_path: path,
    file_size_bytes: file.size,
    mime_type: file.type,
    evidence_type: evidenceType,
    description,
    uploaded_by: profile.id,
    assessment_id: assessmentId,
    risk_id: riskId,
    action_id: actionId,
    participant_id: participantId,
  });
  if (error) err(error.message);

  revalidatePath("/evidence");
  if (assessmentId) revalidatePath(`/assessments/${assessmentId}`, "layout");
}

export async function deleteEvidence(id: string, assessmentId?: string) {
  await requireProfile();
  const supabase = await createClient();
  await supabase.from("evidence").update({ is_deleted: true }).eq("id", id);
  revalidatePath("/evidence");
  if (assessmentId) revalidatePath(`/assessments/${assessmentId}`, "layout");
}

export async function getEvidenceDownloadUrl(storagePath: string) {
  await requireProfile();
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from("evidence").createSignedUrl(storagePath, 60 * 10);
  if (error) err(error.message);
  return data!.signedUrl;
}

// ---------------------------------------------------------------------------
// Approval workflow
// ---------------------------------------------------------------------------
export async function submitForApproval(assessmentId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const errors = await validateAssessmentForSubmission(assessmentId);
  if (errors.length) err(`Cannot submit: ${errors.join(" ")}`);

  const { error } = await supabase
    .from("approvals")
    .insert({ assessment_id: assessmentId, step: "submitted", reviewer_id: profile.id, action: "submit", comments: "Submitted for review." });
  if (error) err(error.message);

  revalidatePath(`/assessments/${assessmentId}`, "layout");
  revalidatePath("/approvals");
  redirect(`/assessments/${assessmentId}`);
}

export async function decideApproval(
  assessmentId: string,
  step: "risk_manager_review" | "process_owner_review" | "approver_review",
  action: "approve" | "reject" | "return_for_revision",
  comments?: string
) {
  const profile = await requireProfile();
  if (action !== "approve" && !comments?.trim()) {
    err("Comments are required when rejecting or returning an assessment for revision.");
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("approvals")
    .insert({ assessment_id: assessmentId, step, reviewer_id: profile.id, action, comments });
  if (error) err(error.message);

  revalidatePath(`/assessments/${assessmentId}`, "layout");
  revalidatePath("/approvals");
  revalidatePath("/dashboard");
}

/** Section 39 validation: what must be true before an assessment can be submitted. */
export async function validateAssessmentForSubmission(assessmentId: string): Promise<string[]> {
  const supabase = await createClient();
  const errors: string[] = [];

  const { data: assessment } = await supabase.from("assessments").select("*").eq("id", assessmentId).single();
  if (!assessment) return ["Assessment not found."];

  const { data: risks } = await supabase.from("risks").select("*").eq("assessment_id", assessmentId).eq("is_deleted", false);
  if (!risks || risks.length === 0) errors.push("At least one risk is required.");

  for (const r of risks ?? []) {
    if (!r.cause && !r.event && !r.consequence_text) errors.push(`Risk ${r.risk_code}: risk statement (cause/event/consequence) is required.`);
    if (r.inherent_likelihood == null || r.inherent_impact == null) errors.push(`Risk ${r.risk_code}: inherent likelihood and impact are required.`);
    if (r.treatment == null) errors.push(`Risk ${r.risk_code}: a treatment decision (Mitigate/Accept/Avoid/Transfer) is required.`);
    if (r.treatment === "accept" && (!r.acceptance_justification || !r.acceptance_authority)) {
      errors.push(`Risk ${r.risk_code}: risk acceptance requires a justification and acceptance authority.`);
    }
    if (r.treatment === "mitigate") {
      const { count } = await supabase.from("actions").select("id", { count: "exact", head: true }).eq("risk_id", r.id).eq("is_deleted", false);
      if (!count) errors.push(`Risk ${r.risk_code}: at least one mitigation action is required (treatment = Mitigate).`);
    }
  }

  if (assessment.type === "full") {
    const { count: participantCount } = await supabase
      .from("assessment_participants")
      .select("id", { count: "exact", head: true })
      .eq("assessment_id", assessmentId);
    if (!participantCount) errors.push("At least one participant is required for a Full Risk Assessment.");
  }

  return errors;
}

// Hand-maintained domain types mirroring supabase/migrations/*.sql.
// Kept in sync manually; if the schema changes, update here too.

export type UserRole =
  | "risk_assessor"
  | "process_owner"
  | "risk_manager"
  | "approver"
  | "auditor"
  | "administrator";

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "risk_assessor", label: "Risk Assessor" },
  { value: "process_owner", label: "Process Owner" },
  { value: "risk_manager", label: "Risk Manager" },
  { value: "approver", label: "Approver" },
  { value: "auditor", label: "Auditor / Read Only" },
  { value: "administrator", label: "Administrator" },
];

export type AssessmentType = "light" | "full";

export type AssessmentStatus =
  | "draft"
  | "in_progress"
  | "pending_approval"
  | "risk_manager_review"
  | "process_owner_review"
  | "approver_review"
  | "approved"
  | "completed"
  | "rejected"
  | "archived";

export const ASSESSMENT_STATUS_LABEL: Record<AssessmentStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  pending_approval: "Pending Approval",
  risk_manager_review: "Risk Manager Review",
  process_owner_review: "Process Owner Review",
  approver_review: "Approver Review",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  archived: "Archived",
};

export type ApplicabilityStatus = "applicable" | "partially_applicable" | "not_applicable";
export type ImplementationStatus =
  | "implemented"
  | "partially_implemented"
  | "not_implemented"
  | "not_applicable";
export type ControlEffectiveness = "effective" | "partially_effective" | "ineffective" | "not_tested";
export type TreatmentOption = "mitigate" | "accept" | "avoid" | "transfer";
export type ActionStatus = "open" | "in_progress" | "completed" | "overdue" | "cancelled" | "on_hold";
export type ActionPriority = "critical" | "high" | "medium" | "low";
export type ExtensionApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalStep =
  | "submitted"
  | "risk_manager_review"
  | "process_owner_review"
  | "approver_review"
  | "approved"
  | "rejected"
  | "returned_for_revision";
export type ApprovalActionType = "approve" | "reject" | "return_for_revision" | "submit";
export type ParticipationType =
  | "workshop"
  | "interview"
  | "technical_review"
  | "risk_assessment"
  | "validation"
  | "approval"
  | "subject_matter_expert";
export type AssetType =
  | "DCS" | "PLC" | "SCADA" | "SIS" | "Historian" | "Engineering_Workstation"
  | "HMI" | "Server" | "Network_Device" | "Firewall" | "Application" | "Other";
export type RiskRating = "Low" | "Medium" | "High" | "Critical";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  job_title: string | null;
  department_id: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department { id: string; name: string; is_active: boolean }
export interface BusinessUnit { id: string; name: string; is_active: boolean }
export interface RiskCategory { id: string; name: string; description: string | null; sort_order: number }
export interface ControlCategory { id: string; name: string; description: string | null }
export interface ActionPriorityConfig { id: string; code: ActionPriority; label: string; sla_days: number }
export interface OtLevel { id: string; code: string; name: string; description: string | null; sort_order: number }
export interface RiskLikelihoodLevel { value: number; label: string; description: string | null }
export interface RiskImpactLevel { value: number; label: string; description: string | null }
export interface RiskRatingThreshold {
  id: string; rating: string; min_score: number; max_score: number; color: string; sort_order: number;
}
export interface ControlDef {
  id: string; control_code: string; name: string; description: string | null; category_id: string | null; is_active: boolean;
}

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  asset_type: AssetType;
  system_name: string | null;
  location: string | null;
  business_process: string | null;
  criticality: "Low" | "Medium" | "High" | "Critical";
  owner_id: string | null;
  environment: string | null;
  network_zone: string | null;
  department_id: string | null;
  is_deleted: boolean;
}

export interface Assessment {
  id: string;
  assessment_code: string;
  title: string;
  type: AssessmentType;
  status: AssessmentStatus;
  wizard_step: number;
  asset_id: string | null;
  asset_id_text: string | null;
  business_unit_id: string | null;
  location: string | null;
  process_owner_id: string | null;
  assessment_owner_id: string | null;
  assessment_date: string | null;
  due_date: string | null;
  completion_date: string | null;
  reason_for_assessment: string | null;
  description: string | null;
  objective: string | null;
  scope_in: string | null;
  scope_out: string | null;
  boundary: string | null;
  business_process: string | null;
  ot_environment: string | null;
  network_zone: string | null;
  methodology: string | null;
  scope_system: string | null;
  scope_asset: string | null;
  scope_technology: string | null;
  assessment_criteria: string | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentParticipant {
  id: string;
  assessment_id: string;
  name: string;
  job_title: string | null;
  department: string | null;
  organization: string | null;
  role_in_assessment: string | null;
  email: string | null;
  participation_type: ParticipationType;
  date_participated: string | null;
  comments: string | null;
  created_at: string;
}

export interface Risk {
  id: string;
  risk_code: string;
  assessment_id: string;
  lineage_key: string | null;
  title: string;
  cause: string | null;
  event: string | null;
  consequence_text: string | null;
  risk_statement: string | null;
  category_id: string | null;
  source: string | null;
  threat: string | null;
  vulnerability: string | null;
  consequence: string | null;
  affected_asset_id: string | null;
  affected_process: string | null;
  existing_controls_text: string | null;
  inherent_likelihood: number | null;
  inherent_impact: number | null;
  inherent_score: number | null;
  residual_likelihood: number | null;
  residual_impact: number | null;
  residual_score: number | null;
  treatment: TreatmentOption | null;
  acceptance_justification: string | null;
  acceptance_authority: string | null;
  acceptance_date: string | null;
  avoidance_explanation: string | null;
  transfer_method: string | null;
  owner_id: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentControl {
  id: string;
  assessment_id: string;
  control_id: string;
  applicability: ApplicabilityStatus;
  na_justification: string | null;
  implementation_status: ImplementationStatus;
  control_owner_id: string | null;
  evidence_available: boolean;
  evidence_reference: string | null;
  effectiveness: ControlEffectiveness;
  comments: string | null;
}

export interface ActionItem {
  id: string;
  action_code: string;
  risk_id: string;
  assessment_id: string;
  description: string;
  owner_id: string | null;
  department_id: string | null;
  priority: ActionPriority;
  target_date: string;
  status: ActionStatus;
  completion_date: string | null;
  comments: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionExtension {
  id: string;
  action_id: string;
  current_target_date: string;
  requested_target_date: string;
  reason: string;
  risk_impact: string | null;
  compensating_controls: string | null;
  requested_by: string | null;
  approval_authority: string | null;
  approval_status: ExtensionApprovalStatus;
  decided_by: string | null;
  decided_at: string | null;
  decision_comments: string | null;
  created_at: string;
}

export interface Evidence {
  id: string;
  evidence_code: string;
  file_name: string;
  storage_bucket: string;
  storage_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  evidence_type: string;
  description: string | null;
  uploaded_by: string | null;
  upload_date: string;
  assessment_id: string | null;
  risk_id: string | null;
  assessment_control_id: string | null;
  action_id: string | null;
  participant_id: string | null;
  version: number;
}

export interface Approval {
  id: string;
  assessment_id: string;
  step: ApprovalStep;
  reviewer_id: string | null;
  action: ApprovalActionType;
  comments: string | null;
  decided_at: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  occurred_at: string;
  object_type: string;
  object_id: string;
  action: "insert" | "update" | "delete";
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_object_type: string | null;
  related_object_id: string | null;
  is_read: boolean;
  created_at: string;
}

// ---- Reporting views (supabase/migrations/0004_views.sql) ----
export interface VRisk {
  id: string;
  risk_code: string;
  assessment_id: string;
  assessment_code: string;
  assessment_title: string;
  assessment_status: AssessmentStatus;
  risk_title: string;
  risk_statement: string | null;
  asset_id: string | null;
  asset_code: string | null;
  asset_name: string | null;
  category_name: string | null;
  inherent_likelihood: number | null;
  inherent_impact: number | null;
  inherent_score: number | null;
  inherent_rating: RiskRating | null;
  inherent_color: string | null;
  residual_likelihood: number | null;
  residual_impact: number | null;
  residual_score: number | null;
  residual_rating: RiskRating | null;
  residual_color: string | null;
  risk_reduction_pct: number | null;
  treatment: TreatmentOption | null;
  status: string;
  owner_id: string | null;
  owner_name: string | null;
  business_unit_id: string | null;
  business_unit_name: string | null;
  assessment_owner_id: string | null;
  lineage_key: string | null;
  created_at: string;
  updated_at: string;
  assessment_year: number | null;
}

export interface VAction {
  id: string;
  action_code: string;
  risk_id: string;
  risk_code: string;
  risk_title: string;
  assessment_id: string;
  assessment_code: string;
  description: string;
  owner_id: string | null;
  owner_name: string | null;
  department_id: string | null;
  department_name: string | null;
  priority: ActionPriority;
  target_date: string;
  completion_date: string | null;
  comments: string | null;
  effective_status: ActionStatus | "cancelled" | "on_hold";
  days_overdue: number;
  created_at: string;
  updated_at: string;
}

export interface VAssessmentInventory {
  id: string;
  assessment_code: string;
  title: string;
  type: AssessmentType;
  status: AssessmentStatus;
  asset_code: string | null;
  asset_name: string | null;
  business_unit_name: string | null;
  owner_name: string | null;
  assessment_date: string | null;
  completion_date: string | null;
  due_date: string | null;
  risk_count: number;
  highest_inherent_score: number | null;
  highest_risk_rating: RiskRating | null;
  is_overdue: boolean;
  created_at: string;
}

export interface VRiskHistory {
  lineage_key: string;
  risk_id: string;
  risk_code: string;
  title: string;
  assessment_year: number;
  inherent_score: number | null;
  inherent_rating: RiskRating | null;
  residual_score: number | null;
  residual_rating: RiskRating | null;
  assessment_date: string;
}

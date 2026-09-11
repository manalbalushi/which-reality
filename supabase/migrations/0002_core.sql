-- ============================================================================
-- OT Risk Management — Core workflow tables (0002)
-- Assessments -> Scope -> Participants -> Assets -> Risks -> Controls ->
-- Treatment -> Actions -> Evidence -> Approvals
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Assessments
-- ----------------------------------------------------------------------------
create table assessments (
  id uuid primary key default gen_random_uuid(),
  assessment_code text not null unique, -- RA-2026-001
  title text not null,
  type assessment_type not null default 'light',
  status assessment_status not null default 'draft',
  wizard_step int not null default 1,

  -- Assessment Information
  asset_id uuid references assets(id),
  asset_id_text text, -- free-text asset id when not linked to catalog
  business_unit_id uuid references business_units(id),
  location text,
  process_owner_id uuid references profiles(id),
  assessment_owner_id uuid references profiles(id),
  assessment_date date,
  due_date date,
  completion_date date,
  reason_for_assessment text,
  description text,

  -- Scope
  objective text,
  scope_in text,
  scope_out text,
  boundary text,
  business_process text,
  ot_environment text,
  network_zone text,
  methodology text,
  scope_system text,
  scope_asset text,
  scope_technology text,
  assessment_criteria text,
  start_date date,
  end_date date,

  created_by uuid references profiles(id),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_assessments_status on assessments(status);
create index idx_assessments_type on assessments(type);
create index idx_assessments_owner on assessments(assessment_owner_id);

create table assessment_ot_levels (
  assessment_id uuid not null references assessments(id) on delete cascade,
  ot_level_id uuid not null references ot_levels(id),
  primary key (assessment_id, ot_level_id)
);

create table assessment_assets (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  asset_id uuid not null references assets(id),
  created_at timestamptz not null default now(),
  unique (assessment_id, asset_id)
);

-- ----------------------------------------------------------------------------
-- Participants (section 12)
-- ----------------------------------------------------------------------------
create table assessment_participants (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  name text not null,
  job_title text,
  department text,
  organization text,
  role_in_assessment text,
  email text,
  participation_type participation_type not null default 'workshop',
  date_participated date,
  comments text,
  created_at timestamptz not null default now()
);

create index idx_participants_assessment on assessment_participants(assessment_id);

-- ----------------------------------------------------------------------------
-- Risks (section 14, 17-20)
-- ----------------------------------------------------------------------------
create table risks (
  id uuid primary key default gen_random_uuid(),
  risk_code text not null unique, -- RA-2026-001-R01
  assessment_id uuid not null references assessments(id) on delete cascade,
  lineage_key text, -- groups the "same" real-world risk across periodic re-assessments for trend history

  title text not null,
  cause text,
  event text,
  consequence_text text,
  risk_statement text, -- "Because of [CAUSE], there is a risk that [EVENT], resulting in [CONSEQUENCE]."
  category_id uuid references risk_categories(id),
  source text,
  threat text,
  vulnerability text,
  consequence text,
  affected_asset_id uuid references assets(id),
  affected_process text,
  existing_controls_text text,

  -- Inherent risk
  inherent_likelihood int references risk_likelihood_levels(value),
  inherent_impact int references risk_impact_levels(value),
  inherent_score int generated always as (
    case when inherent_likelihood is not null and inherent_impact is not null
      then inherent_likelihood * inherent_impact else null end
  ) stored,

  -- Residual risk
  residual_likelihood int references risk_likelihood_levels(value),
  residual_impact int references risk_impact_levels(value),
  residual_score int generated always as (
    case when residual_likelihood is not null and residual_impact is not null
      then residual_likelihood * residual_impact else null end
  ) stored,

  -- Treatment
  treatment treatment_option,
  acceptance_justification text,
  acceptance_authority text,
  acceptance_date date,
  avoidance_explanation text,
  transfer_method text,

  owner_id uuid references profiles(id),
  status text not null default 'open' check (status in ('open','mitigating','closed','accepted')),

  created_by uuid references profiles(id),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_risks_assessment on risks(assessment_id);
create index idx_risks_category on risks(category_id);
create index idx_risks_lineage on risks(lineage_key);

-- ----------------------------------------------------------------------------
-- Applicability & Control Assessment (section 15-16)
-- ----------------------------------------------------------------------------
create table assessment_controls (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  control_id uuid not null references controls(id),
  applicability applicability_status not null default 'applicable',
  na_justification text,
  implementation_status implementation_status not null default 'not_implemented',
  control_owner_id uuid references profiles(id),
  evidence_available boolean not null default false,
  evidence_reference text,
  effectiveness control_effectiveness not null default 'not_tested',
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, control_id),
  constraint chk_na_justification check (
    applicability <> 'not_applicable' or (na_justification is not null and length(trim(na_justification)) > 0)
  )
);

create table risk_controls (
  risk_id uuid not null references risks(id) on delete cascade,
  assessment_control_id uuid not null references assessment_controls(id) on delete cascade,
  primary key (risk_id, assessment_control_id)
);

-- ----------------------------------------------------------------------------
-- Mitigation Action Register (section 21-22)
-- ----------------------------------------------------------------------------
create table actions (
  id uuid primary key default gen_random_uuid(),
  action_code text not null unique, -- ACT-2026-0001
  risk_id uuid not null references risks(id) on delete cascade,
  assessment_id uuid not null references assessments(id) on delete cascade,
  description text not null,
  owner_id uuid not null references profiles(id),
  department_id uuid references departments(id),
  priority action_priority not null default 'medium',
  target_date date not null,
  status action_status not null default 'open',
  completion_date date,
  comments text,
  created_by uuid references profiles(id),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_completed_has_date check (status <> 'completed' or completion_date is not null)
);

create index idx_actions_risk on actions(risk_id);
create index idx_actions_assessment on actions(assessment_id);
create index idx_actions_status on actions(status);
create index idx_actions_owner on actions(owner_id);

create table action_extensions (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references actions(id) on delete cascade,
  current_target_date date not null,
  requested_target_date date not null,
  reason text not null,
  risk_impact text,
  compensating_controls text,
  requested_by uuid references profiles(id),
  approval_authority uuid references profiles(id),
  approval_status extension_approval_status not null default 'pending',
  decided_by uuid references profiles(id),
  decided_at timestamptz,
  decision_comments text,
  created_at timestamptz not null default now()
);

create index idx_extensions_action on action_extensions(action_id);

-- ----------------------------------------------------------------------------
-- Evidence Repository (section 23)
-- ----------------------------------------------------------------------------
create table evidence (
  id uuid primary key default gen_random_uuid(),
  evidence_code text not null unique, -- EVD-2026-0001
  file_name text not null,
  storage_bucket text not null default 'evidence',
  storage_path text not null,
  file_size_bytes bigint,
  mime_type text,
  evidence_type text not null default 'Document',
  description text,
  uploaded_by uuid references profiles(id),
  upload_date timestamptz not null default now(),

  assessment_id uuid references assessments(id) on delete set null,
  risk_id uuid references risks(id) on delete set null,
  assessment_control_id uuid references assessment_controls(id) on delete set null,
  action_id uuid references actions(id) on delete set null,
  participant_id uuid references assessment_participants(id) on delete set null,

  version int not null default 1,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_evidence_assessment on evidence(assessment_id);
create index idx_evidence_risk on evidence(risk_id);
create index idx_evidence_action on evidence(action_id);

-- ----------------------------------------------------------------------------
-- Approval Workflow (section 28)
-- ----------------------------------------------------------------------------
create table approvals (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  step approval_step not null,
  reviewer_id uuid references profiles(id),
  action approval_action not null,
  comments text,
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint chk_reject_has_comments check (
    action not in ('reject','return_for_revision') or (comments is not null and length(trim(comments)) > 0)
  )
);

create index idx_approvals_assessment on approvals(assessment_id);

-- ----------------------------------------------------------------------------
-- Audit Trail (section 29) — append only, no update/delete for anyone
-- ----------------------------------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  occurred_at timestamptz not null default now(),
  object_type text not null,
  object_id text not null,
  action audit_action not null,
  field_changed text,
  old_value text,
  new_value text,
  reason text
);

create index idx_audit_object on audit_logs(object_type, object_id);
create index idx_audit_user on audit_logs(user_id);
create index idx_audit_occurred on audit_logs(occurred_at desc);

-- ----------------------------------------------------------------------------
-- Notifications (section 35)
-- ----------------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  related_object_type text,
  related_object_id text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, is_read);

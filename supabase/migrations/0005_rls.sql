-- ============================================================================
-- OT Risk Management — Row Level Security (0005)
-- Roles: risk_assessor, process_owner, risk_manager, approver, auditor,
-- administrator. Auditor and all other authenticated roles can read
-- everything (single source of truth / transparency); writes are gated by
-- role. Administrator has full access. audit_logs is insert-only via a
-- SECURITY DEFINER trigger — no role, including administrator, can write to
-- it directly through the API.
-- ============================================================================

create or replace function auth_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select auth_role() = 'administrator'; $$;

create or replace function can_edit_content()
returns boolean language sql stable security definer set search_path = public
as $$ select auth_role() in ('risk_assessor','process_owner','risk_manager','approver','administrator'); $$;

create or replace function can_manage_reference_data()
returns boolean language sql stable security definer set search_path = public
as $$ select auth_role() = 'administrator'; $$;

alter table profiles enable row level security;
alter table departments enable row level security;
alter table business_units enable row level security;
alter table assessment_types_config enable row level security;
alter table risk_categories enable row level security;
alter table control_categories enable row level security;
alter table action_priorities_config enable row level security;
alter table ot_levels enable row level security;
alter table risk_likelihood_levels enable row level security;
alter table risk_impact_levels enable row level security;
alter table risk_rating_thresholds enable row level security;
alter table controls enable row level security;
alter table assets enable row level security;
alter table assessments enable row level security;
alter table assessment_ot_levels enable row level security;
alter table assessment_assets enable row level security;
alter table assessment_participants enable row level security;
alter table risks enable row level security;
alter table assessment_controls enable row level security;
alter table risk_controls enable row level security;
alter table actions enable row level security;
alter table action_extensions enable row level security;
alter table evidence enable row level security;
alter table approvals enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;

-- profiles
create policy p_profiles_select on profiles for select using (auth.uid() is not null);
create policy p_profiles_update_self on profiles for update using (id = auth.uid() or is_admin());
create policy p_profiles_insert_admin on profiles for insert with check (is_admin() or id = auth.uid());

-- reference/config tables: read for all authenticated, write for administrator
do $$
declare
  t text;
begin
  foreach t in array array[
    'departments','business_units','assessment_types_config','risk_categories',
    'control_categories','action_priorities_config','ot_levels',
    'risk_likelihood_levels','risk_impact_levels','risk_rating_thresholds','controls'
  ]
  loop
    execute format('create policy p_%1$s_select on %1$s for select using (auth.uid() is not null);', t);
    execute format('create policy p_%1$s_write on %1$s for all using (can_manage_reference_data()) with check (can_manage_reference_data());', t);
  end loop;
end $$;

-- assets
create policy p_assets_select on assets for select using (auth.uid() is not null);
create policy p_assets_write on assets for all using (can_edit_content()) with check (can_edit_content());

-- assessments
create policy p_assessments_select on assessments for select using (auth.uid() is not null);
create policy p_assessments_insert on assessments for insert with check (can_edit_content());
create policy p_assessments_update on assessments for update using (
  can_edit_content() and (created_by = auth.uid() or assessment_owner_id = auth.uid() or auth_role() in ('risk_manager','administrator','approver','process_owner'))
) with check (can_edit_content());

create policy p_assessment_ot_levels_select on assessment_ot_levels for select using (auth.uid() is not null);
create policy p_assessment_ot_levels_write on assessment_ot_levels for all using (can_edit_content()) with check (can_edit_content());

create policy p_assessment_assets_select on assessment_assets for select using (auth.uid() is not null);
create policy p_assessment_assets_write on assessment_assets for all using (can_edit_content()) with check (can_edit_content());

create policy p_participants_select on assessment_participants for select using (auth.uid() is not null);
create policy p_participants_write on assessment_participants for all using (can_edit_content()) with check (can_edit_content());

-- risks
create policy p_risks_select on risks for select using (auth.uid() is not null);
create policy p_risks_write on risks for all using (can_edit_content()) with check (can_edit_content());

-- controls assessment
create policy p_assessment_controls_select on assessment_controls for select using (auth.uid() is not null);
create policy p_assessment_controls_write on assessment_controls for all using (can_edit_content()) with check (can_edit_content());

create policy p_risk_controls_select on risk_controls for select using (auth.uid() is not null);
create policy p_risk_controls_write on risk_controls for all using (can_edit_content()) with check (can_edit_content());

-- actions
create policy p_actions_select on actions for select using (auth.uid() is not null);
create policy p_actions_write on actions for all using (can_edit_content()) with check (can_edit_content());

create policy p_extensions_select on action_extensions for select using (auth.uid() is not null);
create policy p_extensions_insert on action_extensions for insert with check (can_edit_content());
create policy p_extensions_update on action_extensions for update using (
  auth_role() in ('risk_manager','administrator','approver')
) with check (auth_role() in ('risk_manager','administrator','approver'));

-- evidence
create policy p_evidence_select on evidence for select using (auth.uid() is not null);
create policy p_evidence_write on evidence for all using (can_edit_content()) with check (can_edit_content());

-- approvals: everyone reads; only reviewer-capable roles insert decisions;
-- assessors may insert a 'submit' action for assessments they own
create policy p_approvals_select on approvals for select using (auth.uid() is not null);
create policy p_approvals_insert on approvals for insert with check (
  (action = 'submit' and can_edit_content())
  or (action <> 'submit' and auth_role() in ('risk_manager','process_owner','approver','administrator'))
);

-- audit_logs: read-only for everyone via API; writes happen only through the
-- SECURITY DEFINER trigger (fn_audit_trigger), which bypasses RLS as the
-- function/table owner. No insert/update/delete policy is defined, so all
-- direct client mutation attempts are denied.
create policy p_audit_select on audit_logs for select using (auth.uid() is not null);

-- notifications: users see and manage only their own
create policy p_notifications_select on notifications for select using (user_id = auth.uid());
create policy p_notifications_update on notifications for update using (user_id = auth.uid());
create policy p_notifications_insert on notifications for insert with check (auth.uid() is not null);

-- Make approval status-transition trigger privileged so approvers (who may
-- not have direct UPDATE rights on assessments outside p_assessments_update)
-- can still move the workflow forward when they insert an approval decision.
alter function trg_approvals_apply() security definer set search_path = public;

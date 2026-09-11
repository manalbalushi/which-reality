-- ============================================================================
-- OT Risk Management — Notification triggers (0007, section 35)
-- Generates real notifications on the events the spec calls out, instead of
-- relying on the application layer to remember to create them.
-- ============================================================================

create or replace function fn_notify_users_with_role(p_role user_role, p_type notification_type, p_title text, p_message text, p_object_type text, p_object_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, type, title, message, related_object_type, related_object_id)
  select id, p_type, p_title, p_message, p_object_type, p_object_id
  from profiles
  where role = p_role and is_active = true;
end;
$$;

-- ----------------------------------------------------------------------------
-- Assessment assigned (owner set or changed)
-- ----------------------------------------------------------------------------
create or replace function fn_notify_assessment_assigned()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.assessment_owner_id is not null and (tg_op = 'INSERT' or new.assessment_owner_id is distinct from old.assessment_owner_id) then
    insert into notifications (user_id, type, title, message, related_object_type, related_object_id)
    values (new.assessment_owner_id, 'assessment_assigned', 'Assessment assigned: ' || new.assessment_code,
      'You have been assigned as owner of "' || new.title || '".', 'assessment', new.id::text);
  end if;
  return new;
end;
$$;

create trigger t_notify_assessment_assigned
after insert or update of assessment_owner_id on assessments
for each row execute function fn_notify_assessment_assigned();

-- ----------------------------------------------------------------------------
-- Action assigned (owner set or changed)
-- ----------------------------------------------------------------------------
create or replace function fn_notify_action_assigned()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.owner_id is not null and (tg_op = 'INSERT' or new.owner_id is distinct from old.owner_id) then
    insert into notifications (user_id, type, title, message, related_object_type, related_object_id)
    values (new.owner_id, 'action_assigned', 'Action assigned: ' || new.action_code,
      new.description || ' — target date ' || new.target_date, 'action', new.id::text);
  end if;
  return new;
end;
$$;

create trigger t_notify_action_assigned
after insert or update of owner_id on actions
for each row execute function fn_notify_action_assigned();

-- ----------------------------------------------------------------------------
-- Approval workflow: notify the next reviewer role, or the assessment owner
-- on a terminal decision.
-- ----------------------------------------------------------------------------
create or replace function fn_notify_approval_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_assessment assessments%rowtype;
  v_owner uuid;
begin
  select * into v_assessment from assessments where id = new.assessment_id;
  v_owner := coalesce(v_assessment.assessment_owner_id, v_assessment.created_by);

  if new.action = 'submit' then
    perform fn_notify_users_with_role('risk_manager', 'risk_requires_review',
      'Review requested: ' || v_assessment.assessment_code, v_assessment.title || ' was submitted for review.', 'assessment', new.assessment_id::text);
  elsif new.action = 'approve' and new.step = 'risk_manager_review' then
    perform fn_notify_users_with_role('process_owner', 'risk_requires_review',
      'Review requested: ' || v_assessment.assessment_code, v_assessment.title || ' passed Risk Manager review.', 'assessment', new.assessment_id::text);
  elsif new.action = 'approve' and new.step = 'process_owner_review' then
    perform fn_notify_users_with_role('approver', 'risk_requires_review',
      'Review requested: ' || v_assessment.assessment_code, v_assessment.title || ' passed Process Owner review.', 'assessment', new.assessment_id::text);
  elsif new.action = 'approve' and new.step = 'approver_review' and v_owner is not null then
    insert into notifications (user_id, type, title, message, related_object_type, related_object_id)
    values (v_owner, 'assessment_approved', 'Assessment approved: ' || v_assessment.assessment_code,
      v_assessment.title || ' has been approved and completed.', 'assessment', new.assessment_id::text);
  elsif new.action = 'reject' and v_owner is not null then
    insert into notifications (user_id, type, title, message, related_object_type, related_object_id)
    values (v_owner, 'assessment_rejected', 'Assessment rejected: ' || v_assessment.assessment_code,
      coalesce(new.comments, 'The assessment was rejected.'), 'assessment', new.assessment_id::text);
  elsif new.action = 'return_for_revision' and v_owner is not null then
    insert into notifications (user_id, type, title, message, related_object_type, related_object_id)
    values (v_owner, 'assessment_returned', 'Returned for revision: ' || v_assessment.assessment_code,
      coalesce(new.comments, 'The assessment was returned for revision.'), 'assessment', new.assessment_id::text);
  end if;

  return new;
end;
$$;

create trigger t_notify_approval_event
after insert on approvals
for each row execute function fn_notify_approval_event();

-- ----------------------------------------------------------------------------
-- Target date extension requests and decisions
-- ----------------------------------------------------------------------------
create or replace function fn_notify_extension_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_action actions%rowtype;
begin
  select * into v_action from actions where id = coalesce(new.action_id, old.action_id);

  if tg_op = 'INSERT' then
    perform fn_notify_users_with_role('risk_manager', 'extension_requested',
      'Extension requested: ' || v_action.action_code,
      'Requested new target date ' || new.requested_target_date || '. Reason: ' || new.reason, 'action', v_action.id::text);
  elsif tg_op = 'UPDATE' and new.approval_status is distinct from old.approval_status and new.approval_status <> 'pending' and new.requested_by is not null then
    insert into notifications (user_id, type, title, message, related_object_type, related_object_id)
    values (new.requested_by, 'extension_decided', 'Extension ' || new.approval_status || ': ' || v_action.action_code,
      coalesce(new.decision_comments, 'Your extension request was ' || new.approval_status || '.'), 'action', v_action.id::text);
  end if;

  return new;
end;
$$;

create trigger t_notify_extension_event
after insert or update on action_extensions
for each row execute function fn_notify_extension_event();

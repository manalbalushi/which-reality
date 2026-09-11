-- ============================================================================
-- OT Risk Management — Functions & Triggers (0003)
-- Auto-generated IDs, computed risk ratings, overdue detection, audit trail.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Sequential, year-scoped human-readable codes (RA-2026-001, ACT-2026-0001, EVD-2026-0001)
-- ----------------------------------------------------------------------------
create or replace function next_code(p_scope text, p_prefix text, p_pad int)
returns text
language plpgsql
as $$
declare
  v_year int := extract(year from now())::int;
  v_counter int;
begin
  insert into id_counters (scope, year, counter)
  values (p_scope, v_year, 1)
  on conflict (scope) do update
    set counter = case when id_counters.year = v_year then id_counters.counter + 1 else 1 end,
        year = v_year
  returning counter into v_counter;

  return p_prefix || '-' || v_year || '-' || lpad(v_counter::text, p_pad, '0');
end;
$$;

create or replace function trg_assessments_set_code()
returns trigger language plpgsql as $$
begin
  if new.assessment_code is null then
    new.assessment_code := next_code('assessment', 'RA', 3);
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger t_assessments_set_code
before insert on assessments
for each row execute function trg_assessments_set_code();

create or replace function trg_assessments_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger t_assessments_touch
before update on assessments
for each row execute function trg_assessments_touch();

-- Risk codes: <ASSESSMENT_CODE>-R01, sequential per assessment
create or replace function trg_risks_set_code()
returns trigger language plpgsql as $$
declare
  v_assessment_code text;
  v_seq int;
begin
  if new.risk_code is null then
    select assessment_code into v_assessment_code from assessments where id = new.assessment_id;
    select count(*) + 1 into v_seq from risks where assessment_id = new.assessment_id;
    new.risk_code := v_assessment_code || '-R' || lpad(v_seq::text, 2, '0');
  end if;
  if new.risk_statement is null and (new.cause is not null or new.event is not null or new.consequence_text is not null) then
    new.risk_statement := concat_ws(' ',
      case when new.cause is not null then 'Because of ' || new.cause || ',' end,
      case when new.event is not null then 'there is a risk that ' || new.event || ',' end,
      case when new.consequence_text is not null then 'resulting in ' || new.consequence_text || '.' end
    );
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger t_risks_set_code
before insert on risks
for each row execute function trg_risks_set_code();

create or replace function trg_risks_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.risk_statement is null and (new.cause is not null or new.event is not null or new.consequence_text is not null) then
    new.risk_statement := concat_ws(' ',
      case when new.cause is not null then 'Because of ' || new.cause || ',' end,
      case when new.event is not null then 'there is a risk that ' || new.event || ',' end,
      case when new.consequence_text is not null then 'resulting in ' || new.consequence_text || '.' end
    );
  end if;
  return new;
end;
$$;

create trigger t_risks_touch
before update on risks
for each row execute function trg_risks_touch();

create or replace function trg_actions_set_code()
returns trigger language plpgsql as $$
begin
  if new.action_code is null then
    new.action_code := next_code('action', 'ACT', 4);
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger t_actions_set_code
before insert on actions
for each row execute function trg_actions_set_code();

create or replace function trg_actions_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger t_actions_touch
before update on actions
for each row execute function trg_actions_touch();

create or replace function trg_evidence_set_code()
returns trigger language plpgsql as $$
begin
  if new.evidence_code is null then
    new.evidence_code := next_code('evidence', 'EVD', 4);
  end if;
  return new;
end;
$$;

create trigger t_evidence_set_code
before insert on evidence
for each row execute function trg_evidence_set_code();

-- ----------------------------------------------------------------------------
-- Risk rating lookup (configurable thresholds, section 17/33)
-- ----------------------------------------------------------------------------
create or replace function fn_risk_rating(p_score int)
returns text
language sql stable
as $$
  select rating from risk_rating_thresholds
  where p_score between min_score and max_score
  order by sort_order
  limit 1;
$$;

create or replace function fn_risk_color(p_score int)
returns text
language sql stable
as $$
  select color from risk_rating_thresholds
  where p_score between min_score and max_score
  order by sort_order
  limit 1;
$$;

-- ----------------------------------------------------------------------------
-- Generic audit trail trigger — logs INSERT/UPDATE/DELETE on key tables
-- ----------------------------------------------------------------------------
create or replace function fn_audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_col text;
  v_old text;
  v_new text;
  v_old_row jsonb;
  v_new_row jsonb;
begin
  begin
    v_user := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  exception when others then
    v_user := null;
  end;

  if tg_op = 'INSERT' then
    insert into audit_logs (user_id, object_type, object_id, action, field_changed, old_value, new_value)
    values (v_user, tg_table_name, new.id::text, 'insert', null, null, null);
    return new;
  elsif tg_op = 'DELETE' then
    insert into audit_logs (user_id, object_type, object_id, action, field_changed, old_value, new_value)
    values (v_user, tg_table_name, old.id::text, 'delete', null, null, null);
    return old;
  else
    v_old_row := to_jsonb(old);
    v_new_row := to_jsonb(new);
    for v_col in select jsonb_object_keys(v_new_row) loop
      if v_col in ('updated_at') then
        continue;
      end if;
      if v_old_row -> v_col is distinct from v_new_row -> v_col then
        v_old := v_old_row ->> v_col;
        v_new := v_new_row ->> v_col;
        insert into audit_logs (user_id, object_type, object_id, action, field_changed, old_value, new_value)
        values (v_user, tg_table_name, new.id::text, 'update', v_col, v_old, v_new);
      end if;
    end loop;
    return new;
  end if;
end;
$$;

create trigger t_audit_assessments
after insert or update or delete on assessments
for each row execute function fn_audit_trigger();

create trigger t_audit_risks
after insert or update or delete on risks
for each row execute function fn_audit_trigger();

create trigger t_audit_actions
after insert or update or delete on actions
for each row execute function fn_audit_trigger();

create trigger t_audit_assessment_controls
after insert or update or delete on assessment_controls
for each row execute function fn_audit_trigger();

create trigger t_audit_approvals
after insert on approvals
for each row execute function fn_audit_trigger();

create trigger t_audit_evidence
after insert or delete on evidence
for each row execute function fn_audit_trigger();

-- No one may ever UPDATE or DELETE audit_logs (immutability requirement, section 29)
create or replace function fn_block_audit_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'audit_logs is append-only: % is not permitted', tg_op;
end;
$$;

create trigger t_block_audit_update
before update on audit_logs
for each row execute function fn_block_audit_mutation();

create trigger t_block_audit_delete
before delete on audit_logs
for each row execute function fn_block_audit_mutation();

-- ----------------------------------------------------------------------------
-- Approval workflow side-effects: keep assessments.status in sync with the
-- latest approval decision.
-- ----------------------------------------------------------------------------
create or replace function trg_approvals_apply()
returns trigger language plpgsql as $$
begin
  if new.action = 'submit' then
    update assessments set status = 'risk_manager_review' where id = new.assessment_id;
  elsif new.action = 'approve' then
    -- Final approver sign-off moves the assessment straight to the workflow's
    -- terminal state (Draft -> ... -> Approver -> Approved -> Completed).
    update assessments set status = case new.step
      when 'risk_manager_review' then 'process_owner_review'::assessment_status
      when 'process_owner_review' then 'approver_review'::assessment_status
      when 'approver_review' then 'completed'::assessment_status
      else status
    end, completion_date = case when new.step = 'approver_review' then current_date else completion_date end
    where id = new.assessment_id;
  elsif new.action = 'reject' then
    update assessments set status = 'rejected' where id = new.assessment_id;
  elsif new.action = 'return_for_revision' then
    update assessments set status = 'in_progress' where id = new.assessment_id;
  end if;
  return new;
end;
$$;

create trigger t_approvals_apply
after insert on approvals
for each row execute function trg_approvals_apply();

-- ----------------------------------------------------------------------------
-- Profile auto-provision on new auth.users row (Supabase Auth signup)
-- ----------------------------------------------------------------------------
create or replace function fn_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'risk_assessor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger t_on_auth_user_created
after insert on auth.users
for each row execute function fn_handle_new_user();

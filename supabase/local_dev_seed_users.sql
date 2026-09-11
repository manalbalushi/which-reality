-- ============================================================================
-- LOCAL DEV ONLY — inserts demo users directly into the shim auth.users table
-- (bypassing GoTrue, which only exists on real Supabase) so that
-- supabase/seed.sql can be validated end-to-end against plain PostgreSQL.
--
-- In production, these same accounts are created by
-- scripts/seed-auth-users.mjs via the Supabase Admin API, which real
-- GoTrue then fronts with actual password auth. Same emails/roles, same
-- fn_handle_new_user() trigger creates the matching `profiles` row.
-- ============================================================================

insert into auth.users (id, email, raw_user_meta_data) values
  ('10000000-0000-0000-0000-000000000001', 'admin@otrisk.local',          '{"full_name":"Layla Al-Harthi","role":"administrator"}'),
  ('10000000-0000-0000-0000-000000000002', 'risk.manager@otrisk.local',   '{"full_name":"Omar Al-Balushi","role":"risk_manager"}'),
  ('10000000-0000-0000-0000-000000000003', 'assessor@otrisk.local',       '{"full_name":"Ahmed Al-Riyami","role":"risk_assessor"}'),
  ('10000000-0000-0000-0000-000000000004', 'process.owner@otrisk.local',  '{"full_name":"Fatma Al-Zadjali","role":"process_owner"}'),
  ('10000000-0000-0000-0000-000000000005', 'approver@otrisk.local',       '{"full_name":"Khalid Al-Saidi","role":"approver"}'),
  ('10000000-0000-0000-0000-000000000006', 'auditor@otrisk.local',        '{"full_name":"Sara Al-Hinai","role":"auditor"}'),
  ('10000000-0000-0000-0000-000000000007', 'cyber.engineer@otrisk.local', '{"full_name":"Yousuf Al-Balushi","role":"risk_assessor"}'),
  ('10000000-0000-0000-0000-000000000008', 'ot.engineer@otrisk.local',    '{"full_name":"Maryam Al-Lawati","role":"process_owner"}')
on conflict (id) do nothing;

-- The real fn_handle_new_user() trigger only fires on INSERT, so run it
-- manually here for rows the trigger may have missed (idempotent re-runs).
insert into profiles (id, full_name, email, role)
select id, raw_user_meta_data->>'full_name', email, (raw_user_meta_data->>'role')::user_role
from auth.users
on conflict (id) do nothing;

update profiles set job_title = case email
  when 'admin@otrisk.local' then 'OT Cybersecurity Program Manager'
  when 'risk.manager@otrisk.local' then 'OT Risk Manager'
  when 'assessor@otrisk.local' then 'OT Risk Assessor'
  when 'process.owner@otrisk.local' then 'Process Owner, Refining Operations'
  when 'approver@otrisk.local' then 'Director, OT Cybersecurity'
  when 'auditor@otrisk.local' then 'Internal Auditor'
  when 'cyber.engineer@otrisk.local' then 'OT Cybersecurity Engineer'
  when 'ot.engineer@otrisk.local' then 'OT Engineer'
end
where email in (
  'admin@otrisk.local','risk.manager@otrisk.local','assessor@otrisk.local','process.owner@otrisk.local',
  'approver@otrisk.local','auditor@otrisk.local','cyber.engineer@otrisk.local','ot.engineer@otrisk.local'
);

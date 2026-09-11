-- ============================================================================
-- OT Risk Management — Storage bucket + policies for the Evidence Repository
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

create policy p_storage_evidence_select on storage.objects for select
  using (bucket_id = 'evidence' and auth.uid() is not null);

create policy p_storage_evidence_insert on storage.objects for insert
  with check (bucket_id = 'evidence' and auth.uid() is not null);

create policy p_storage_evidence_update on storage.objects for update
  using (bucket_id = 'evidence' and auth.uid() is not null);

create policy p_storage_evidence_delete on storage.objects for delete
  using (bucket_id = 'evidence' and auth_role() in ('administrator','risk_manager'));

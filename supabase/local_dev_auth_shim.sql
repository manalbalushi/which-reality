-- ============================================================================
-- LOCAL DEV ONLY — stand-in for Supabase-managed `auth` and `storage` schemas
-- so the real migrations in supabase/migrations/ can be validated against a
-- plain PostgreSQL instance without Docker/the Supabase CLI.
--
-- Do NOT run this against an actual Supabase project — it already provides
-- real auth.users / storage.objects tables and this script would conflict.
-- ============================================================================

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('app.current_user_id', true), '')::uuid;
$$;

create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid,
  created_at timestamptz default now()
);

-- Minimal stand-ins for functions PostgREST/Supabase normally provides.
create or replace function current_setting_or_null(p_name text) returns text
language sql stable as $$ select current_setting(p_name, true); $$;

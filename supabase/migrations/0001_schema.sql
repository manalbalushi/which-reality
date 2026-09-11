-- ============================================================================
-- OT Risk Management — Core Schema (0001)
-- Enums, configuration/reference tables, and master data tables.
-- Designed to run against a Supabase Postgres project (auth.users already
-- exists there). For local development against plain Postgres, run
-- supabase/local_dev_auth_shim.sql FIRST to create a stand-in auth.users.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type user_role as enum (
  'risk_assessor',
  'process_owner',
  'risk_manager',
  'approver',
  'auditor',
  'administrator'
);

create type assessment_type as enum ('light', 'full');

create type assessment_status as enum (
  'draft',
  'in_progress',
  'pending_approval',
  'risk_manager_review',
  'process_owner_review',
  'approver_review',
  'approved',
  'completed',
  'rejected',
  'archived'
);

create type applicability_status as enum ('applicable', 'partially_applicable', 'not_applicable');

create type implementation_status as enum (
  'implemented',
  'partially_implemented',
  'not_implemented',
  'not_applicable'
);

create type control_effectiveness as enum ('effective', 'partially_effective', 'ineffective', 'not_tested');

create type treatment_option as enum ('mitigate', 'accept', 'avoid', 'transfer');

create type action_status as enum ('open', 'in_progress', 'completed', 'overdue', 'cancelled', 'on_hold');

create type action_priority as enum ('critical', 'high', 'medium', 'low');

create type extension_approval_status as enum ('pending', 'approved', 'rejected');

create type approval_step as enum (
  'submitted',
  'risk_manager_review',
  'process_owner_review',
  'approver_review',
  'approved',
  'rejected',
  'returned_for_revision'
);

create type approval_action as enum ('approve', 'reject', 'return_for_revision', 'submit');

create type participation_type as enum (
  'workshop',
  'interview',
  'technical_review',
  'risk_assessment',
  'validation',
  'approval',
  'subject_matter_expert'
);

create type notification_type as enum (
  'assessment_assigned',
  'assessment_due',
  'assessment_overdue',
  'risk_requires_review',
  'action_assigned',
  'action_due_soon',
  'action_overdue',
  'extension_requested',
  'extension_decided',
  'assessment_approved',
  'assessment_rejected',
  'assessment_returned'
);

create type audit_action as enum ('insert', 'update', 'delete');

-- ----------------------------------------------------------------------------
-- Reference / configuration tables (Administration, section 33)
-- ----------------------------------------------------------------------------
create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table business_units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table assessment_types_config (
  id uuid primary key default gen_random_uuid(),
  code assessment_type not null unique,
  label text not null,
  description text,
  is_active boolean not null default true
);

create table risk_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table control_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table action_priorities_config (
  id uuid primary key default gen_random_uuid(),
  code action_priority not null unique,
  label text not null,
  sort_order int not null default 0,
  sla_days int not null default 30
);

create table ot_levels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- 'L0','L1','L2','L3','L3_5','L4'
  name text not null,
  description text,
  sort_order int not null default 0
);

-- Configurable 5x5 risk matrix (section 17, 33)
create table risk_likelihood_levels (
  value int primary key check (value between 1 and 5),
  label text not null,
  description text
);

create table risk_impact_levels (
  value int primary key check (value between 1 and 5),
  label text not null,
  description text
);

create table risk_rating_thresholds (
  id uuid primary key default gen_random_uuid(),
  rating text not null unique, -- 'Low','Medium','High','Critical'
  min_score int not null,
  max_score int not null,
  color text not null, -- hex, used by UI badges/heatmap
  sort_order int not null default 0,
  check (min_score <= max_score)
);

-- Control catalog (section 16)
create table controls (
  id uuid primary key default gen_random_uuid(),
  control_code text not null unique,
  name text not null,
  description text,
  category_id uuid references control_categories(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Identity: profiles extend auth.users (Supabase-managed)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  job_title text,
  department_id uuid references departments(id),
  role user_role not null default 'risk_assessor',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Sequences for human-readable IDs
-- ----------------------------------------------------------------------------
create sequence assessment_code_seq start 1;
create sequence action_code_seq start 1;

create table id_counters (
  scope text primary key,
  year int not null,
  counter int not null default 0
);

-- ----------------------------------------------------------------------------
-- Assets (section 13)
-- ----------------------------------------------------------------------------
create type asset_type as enum (
  'DCS','PLC','SCADA','SIS','Historian','Engineering_Workstation','HMI',
  'Server','Network_Device','Firewall','Application','Other'
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  asset_code text not null unique,
  name text not null,
  asset_type asset_type not null default 'Other',
  system_name text,
  location text,
  business_process text,
  criticality text not null default 'Medium' check (criticality in ('Low','Medium','High','Critical')),
  owner_id uuid references profiles(id),
  environment text, -- e.g. Production, DR, Test
  network_zone text,
  department_id uuid references departments(id),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table assets is 'OT asset register: DCS/PLC/SCADA/SIS/etc referenced by assessments and risks.';

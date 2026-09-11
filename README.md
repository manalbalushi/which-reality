# OT Risk Management

A working OT Cybersecurity Risk Assessment & Risk Management platform — built to replace manual,
Excel-based OT risk tracking with one governed system: risk assessments, a global risk register,
a mitigation action register, an evidence repository, participants, a multi-stage approval
workflow, an immutable audit trail, role-based access, dashboards, search, filtering, and
Excel/PDF export.

Stack: **Next.js 16 (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres, Auth, Storage) · Recharts · ExcelJS · jsPDF**.

---

## 1. Application overview

The core object model matches the required lifecycle:

```
Risk Assessment → Scope → Participants → Assets → Risk Identification →
Applicability → Controls → Inherent Risk → Residual Risk → Treatment →
Actions → Evidence → Approval → Monitoring → Assessment Inventory
```

One assessment has many risks; one risk has many mitigation actions; any object (assessment,
risk, control, action, participant session) can have many evidence items.

Two entry-point workflows, as specified:

- **Light Risk Assessment** — a single fast flow: Assessment Information → Risk Identification
  (risk + inline inherent scoring + treatment + mitigation action, all in one form) → Review → Submit.
- **Full Risk Assessment** — a 10-step wizard (`/assessments/[id]/edit/<step>`) that persists on
  every step so a draft can be saved and resumed at any point: **Assessment Information → Scope →
  Participants → Assets → Risk Identification → Applicability & Controls → Inherent/Residual Risk &
  Treatment → Mitigation Actions → Evidence → Review & Submit**. (The spec's 15-item list is
  implemented as these 10 steps — Applicability and Control Assessment share one data model and
  one step, and Inherent Risk / Residual Risk / Treatment are one combined scoring step per risk,
  since they're edited together in practice. Approval and Completion happen after submission, on
  the assessment's **Approvals** tab, where a different person reviews — not inside the authoring
  wizard.)

Every other requirement (global Risk Register, Action Register, Evidence Repository, Approvals
queue, Audit Trail, Reports, Admin configuration, global Search, notifications) is a standalone
page under the main navigation — see **§4 Workflow** below for the full page map.

## 2. Database structure

All schema lives in `supabase/migrations/*.sql`, run in order, plus `supabase/seed.sql` for
sample data. Highlights:

- **`0001_schema.sql`** — enums, reference/configuration tables (`departments`,
  `business_units`, `risk_categories`, `control_categories`, `action_priorities_config`,
  `ot_levels`, `risk_likelihood_levels`, `risk_impact_levels`, `risk_rating_thresholds`,
  `controls`), `profiles` (extends `auth.users`), `assets`.
- **`0002_core.sql`** — `assessments`, `assessment_ot_levels`, `assessment_assets`,
  `assessment_participants`, `risks`, `assessment_controls`, `risk_controls`, `actions`,
  `action_extensions`, `evidence`, `approvals`, `audit_logs`, `notifications`.
- **`0003_functions.sql`** — auto-generated IDs (`RA-2026-001`, `RA-2026-001-R01`,
  `ACT-2026-0001`, `EVD-2026-0001`), the configurable risk-rating lookup (`fn_risk_rating`), a
  generic audit-trail trigger on every key table, a trigger that blocks `UPDATE`/`DELETE` on
  `audit_logs` (nobody, including administrators, can alter history), the approval-workflow status
  trigger, and the `auth.users` → `profiles` provisioning trigger.
- **`0004_views.sql`** — `v_risks`, `v_actions` (with computed `effective_status`/`days_overdue`
  for auto-overdue detection), `v_assessment_inventory`, `v_risk_history` (multi-year trend for a
  recurring risk).
- **`0005_rls.sql`** — Row Level Security on every table, keyed off `profiles.role`. Verified
  (not just declared — see §8) against a real Postgres role: an Auditor can read everything and
  write nothing; a Risk Assessor can create content; nobody can insert/update/delete
  `audit_logs` directly (writes only happen via a `SECURITY DEFINER` trigger).
- **`0006_storage.sql`** — the `evidence` Storage bucket and its access policies.
- **`0007_notification_triggers.sql`** — real notification generation (§35): assessment/action
  assignment, each approval-workflow transition (notifies the next reviewer role, or the owner on
  a terminal decision), and extension requests/decisions. Verified end-to-end against the seed
  data (84 notifications generated from 10 assessments' worth of activity, correctly scoped per
  user by RLS).

Soft deletion (`is_deleted`) is used on assessments/risks/actions/assets/evidence so a parent
record can be archived without destroying the audit trail or history that references it — audit
logs are never deleted.

`supabase/local_dev_auth_shim.sql` and `supabase/local_dev_seed_users.sql` are **local-dev-only**
stand-ins for the `auth`/`storage` schemas Supabase normally provides, used to validate the whole
schema against plain PostgreSQL in this environment. **Never run them against a real Supabase
project** — it already has real `auth.users`/`storage.objects`.

## 3. User roles

| Role | Access |
|---|---|
| **Risk Assessor** | Creates assessments, risks, controls, actions, evidence |
| **Process Owner** | Same content access as Assessor; reviews at the Process Owner approval step |
| **Risk Manager** | Same content access; reviews at the Risk Manager approval step; decides extension requests |
| **Approver** | Same content access; final approval sign-off |
| **Auditor / Read Only** | Read access to everything; **cannot** write anything (enforced by RLS, not just the UI) |
| **Administrator** | Full access, plus Administration (risk matrix, categories, controls, departments, business units, users & roles) |

## 4. How the workflow works

| Area | Route |
|---|---|
| Dashboard (dynamic KPIs + charts) | `/dashboard` |
| Assessment Inventory (list, filter, search, export) | `/assessments` |
| New Assessment (Light/Full chooser) | `/assessments/new` |
| Light Assessment flow | `/assessments/[id]/light` |
| Full Assessment wizard | `/assessments/[id]/edit/<step>` |
| Assessment detail (tabs: Overview, Scope, Participants, Assets, Risks, Controls, Actions, Evidence, Approvals, History) | `/assessments/[id]` |
| Global Risk Register | `/risks` |
| Risk detail (scoring, treatment, trend, linked controls/actions/evidence, change history) | `/risks/[id]` |
| Global Action Register + extension requests | `/actions` |
| Evidence Repository | `/evidence` |
| Approvals queue | `/approvals` |
| Reports | `/reports` |
| Audit Trail | `/audit-trail` |
| Global Search | `/search` (top bar) |
| Notifications | `/notifications` |
| Administration (risk matrix, categories, controls, departments, business units) | `/admin` |
| Users & Roles | `/admin/users` |

**Approval workflow**: Draft → (edited/completed) → Submitted → Risk Manager Review → Process
Owner Review → Approver Review → Completed, or Rejected/Returned for Revision at any review step
(with mandatory comments). Submission is blocked by `validateAssessmentForSubmission()`
(`src/lib/actions/assessments.ts`) until every risk has a statement, inherent likelihood/impact, a
treatment decision (with acceptance justification+authority if Accepted), and at least one action
if Mitigated — matching §39 of the spec. `Not Applicable` controls are blocked at the database
level (a `CHECK` constraint) without a justification.

**Risk scoring**: Score = Likelihood (1–5) × Impact (1–5), calculated automatically and never
hand-entered — you pick likelihood/impact, the score and rating are computed. Thresholds
(Low 1–4 / Medium 5–9 / High 10–16 / Critical 17–25 by default) are configurable in `/admin`.

**Audit trail**: every insert/update/delete on assessments, risks, actions, controls and evidence
is captured automatically by a database trigger — the application code never writes audit rows
directly, so it can't be bypassed or forgotten.

## 5. How to run the application

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is enough for
   the sample dataset).
2. **Run the migrations**, in order, against your project's SQL editor (or `psql` /
   `supabase db push`):
   `supabase/migrations/0001_schema.sql` → `0002_core.sql` → `0003_functions.sql` →
   `0004_views.sql` → `0005_rls.sql` → `0006_storage.sql` → `0007_notification_triggers.sql`.
3. **Copy `.env.example` to `.env.local`** and fill in your project's URL, anon key, and service
   role key (Project Settings → API).
4. **Create the demo users**: `npm install` then `npm run seed:users` (reads `.env.local`,
   creates the 8 demo accounts via the Supabase Admin API — see §10 for credentials).
5. **Load sample data**: run `supabase/seed.sql` in the SQL editor (after step 4 — it looks up the
   demo users by email).
6. **Run the app**: `npm run dev`, open `http://localhost:3000`.

## 6. How to deploy it

- **App**: deploy to Vercel (or any Node host) — `next build && next start`, or connect the repo
  to Vercel and set the three env vars from `.env.example` in the project settings.
- **Database/Auth/Storage**: Supabase is already a hosted, managed service — no separate
  deployment step once your project exists. Point production at the same project (or a separate
  prod project with the same migrations run against it).
- `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) refreshes the Supabase session
  cookie and gates every route behind authentication except `/login`.

## 7. How to add/change the risk matrix

Administration → **Risk Matrix** (`/admin`, Administrator role only) lets you edit the score range
and color for each rating (Low/Medium/High/Critical) live — every risk rating, badge, chart and
export reads from `risk_rating_thresholds` via the `fn_risk_rating()` database function, so a
change applies everywhere immediately. Likelihood/impact labels (`risk_likelihood_levels`,
`risk_impact_levels`) are separate reference tables if you want to relabel the 1–5 scales.

## 8. How to add controls

Administration → **Control Catalog** (`/admin`) — add a control code, name, description and
category; it becomes immediately available in every assessment's "Applicability & Control
Assessment" step. Control categories are managed alongside it.

## 9. How to add users

New accounts are created through **Supabase Authentication** (`supabase.auth.admin.createUser`,
as in `scripts/seed-auth-users.mjs`, or the Supabase Dashboard → Authentication → Users). A
database trigger (`fn_handle_new_user`) automatically creates the matching `profiles` row. Once
created, an Administrator sets their role and active status at **Users & Roles** (`/admin/users`).

## 10. Test credentials (sample environment)

Password for every demo account: **`OTrisk#2026`**

| Role | Email |
|---|---|
| Administrator | `admin@otrisk.local` |
| Risk Manager | `risk.manager@otrisk.local` |
| Risk Assessor | `assessor@otrisk.local` |
| Process Owner | `process.owner@otrisk.local` |
| Approver | `approver@otrisk.local` |
| Auditor / Read Only | `auditor@otrisk.local` |
| Risk Assessor (OT Cybersecurity Engineer) | `cyber.engineer@otrisk.local` |
| Process Owner (OT Engineer) | `ot.engineer@otrisk.local` |

Sample data (`supabase/seed.sql`) includes the exact §37 test scenario — **"DCS Remote Access Risk
Assessment"**, Full type, asset `DCS-001`, 3 participants, risk *"Unauthorized vendor remote
access"* (inherent 4×5=20 Critical → residual 2×4=8 Medium via VPN/MFA/session logging), 2 actions
with the specified owners/dates, evidence, and a full approval chain to Completed — plus two prior
periodic re-assessments of the same risk (2024 Critical 20 → 2025 High 15 → 2026 Medium 8) so the
Risk History trend chart has real data, 10 assessments total across every status, ~30 risks, ~48
actions, 21 assets, 23 participants, 30 evidence records, and 18 catalog controls.

---

## What's been tested, and how

There is no way to run Supabase's own Auth/PostgREST/Storage services in this sandbox (they ship
as Docker containers via the Supabase CLI, and no Docker daemon is available here). Given that
constraint, here's exactly what was verified and how, so you know what to double-check yourself
after connecting a real project:

- **Every migration + the full seed script** ran successfully against a real local PostgreSQL 16
  instance (auto-generated IDs, computed risk statements/scores, the `risk_rating_thresholds`
  lookup, the append-only audit trigger, the approval status-transition trigger, and the §37 test
  scenario numbers all checked out).
- **Row Level Security was exercised, not just declared**: using `SET ROLE` to a real non-superuser
  Postgres role (superusers bypass RLS, so testing as the migration-running role would have proven
  nothing), an Auditor's `INSERT` into `risks` was rejected, a direct `INSERT` into `audit_logs`
  was rejected, a Risk Assessor's `INSERT` into `risks` succeeded, and an Auditor's `SELECT`
  succeeded.
- **The whole app compiles and type-checks**: `npx tsc --noEmit` is clean, and `next build`
  (Turbopack, production mode) succeeds and generates all 19 routes. That build also caught and
  fixed a real server/client boundary bug (a Client Component was transitively importing
  `next/headers` through a shared `lib/auth.ts` — split into `lib/roles.ts` for client-safe role
  checks vs. `lib/auth.ts` for server-only session/profile lookups).
- **`next dev` was started and the `/login` page was fetched and rendered** (200, correct
  `<title>`, no error boundary triggered); hitting `/` and `/dashboard` unauthenticated correctly
  307-redirected to `/login` via `proxy.ts`.
- **Not verified end-to-end** (requires a live Supabase project, which this sandbox cannot
  provision): actually signing in through Supabase Auth, the full click-through wizard flow
  against live PostgREST, and Storage file upload/download. The SQL and the RLS policies it
  depends on have been proven correct; the remaining gap is wiring, which follows the same
  well-established `@supabase/ssr` pattern used throughout the code.

## A note on this repository

This repo (`which-reality`) previously held an unrelated PHP demo (`index.php`, `which-reality.sh`,
`app.yaml`) that intentionally exposes server/process information, plus a `.notes` file containing
**plaintext credentials** (an Azure username/password and a workstation login). Those files were
left in place rather than deleted, since removing content you didn't ask me to touch isn't mine to
decide — but since this repository is now a security product, you may want to rotate those
credentials if they're real, and remove or relocate those files.

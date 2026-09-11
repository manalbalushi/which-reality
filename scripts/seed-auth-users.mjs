#!/usr/bin/env node
// Creates the demo user accounts in Supabase Auth using the service role key.
// The fn_handle_new_user() trigger (supabase/migrations/0003_functions.sql)
// automatically creates the matching `profiles` row for each one.
//
// Usage:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-auth-users.mjs
// or, with a .env.local already populated:
//   node -r dotenv/config scripts/seed-auth-users.mjs dotenv_config_path=.env.local

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const PASSWORD = "OTrisk#2026";

const USERS = [
  { email: "admin@otrisk.local", full_name: "Layla Al-Harthi", role: "administrator" },
  { email: "risk.manager@otrisk.local", full_name: "Omar Al-Balushi", role: "risk_manager" },
  { email: "assessor@otrisk.local", full_name: "Ahmed Al-Riyami", role: "risk_assessor" },
  { email: "process.owner@otrisk.local", full_name: "Fatma Al-Zadjali", role: "process_owner" },
  { email: "approver@otrisk.local", full_name: "Khalid Al-Saidi", role: "approver" },
  { email: "auditor@otrisk.local", full_name: "Sara Al-Hinai", role: "auditor" },
  { email: "cyber.engineer@otrisk.local", full_name: "Yousuf Al-Balushi", role: "risk_assessor" },
  { email: "ot.engineer@otrisk.local", full_name: "Maryam Al-Lawati", role: "process_owner" },
];

for (const u of USERS) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.full_name, role: u.role },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists")) {
      console.log(`- ${u.email} already exists, skipping.`);
      continue;
    }
    console.error(`✗ Failed to create ${u.email}:`, error.message);
    continue;
  }

  console.log(`✓ Created ${u.email} (${u.role}) — id ${data.user.id}`);
}

console.log("\nDone. All demo accounts use the password:", PASSWORD);
console.log("Next: run supabase/seed.sql against your project's SQL editor (or `supabase db push` + psql) to populate sample data.");

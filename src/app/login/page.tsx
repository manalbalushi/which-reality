"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input } from "@/components/ui/Form";

const DEMO_ACCOUNTS = [
  { role: "Administrator", email: "admin@otrisk.local" },
  { role: "Risk Manager", email: "risk.manager@otrisk.local" },
  { role: "Risk Assessor", email: "assessor@otrisk.local" },
  { role: "Process Owner", email: "process.owner@otrisk.local" },
  { role: "Approver", email: "approver@otrisk.local" },
  { role: "Auditor / Read Only", email: "auditor@otrisk.local" },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy-950 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={26} className="text-brand-400" />
          <span className="text-lg font-semibold tracking-tight">OT Risk Management</span>
        </div>
        <div>
          <h1 className="max-w-md text-3xl font-semibold leading-tight">
            The single source of truth for OT cybersecurity risk.
          </h1>
          <p className="mt-4 max-w-md text-sm text-slate-300">
            Risk assessments, the risk register, mitigation actions, evidence and approvals —
            replacing spreadsheet-based OT risk tracking with one governed system.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} OT Risk Management. Internal use only.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <ShieldCheck size={24} className="text-navy-900" />
            <span className="text-lg font-semibold text-navy-900">OT Risk Management</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to access the platform.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Email" required>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="username" />
            </Field>
            <Field label="Password" required>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </Field>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold text-slate-600">Demo accounts (password: OTrisk#2026)</p>
            <ul className="space-y-1">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.email} className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{a.role}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(a.email);
                      setPassword("OTrisk#2026");
                    }}
                    className="font-mono text-brand-600 hover:underline"
                  >
                    {a.email}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";

export default function AdminLoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Incorrect password");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="container-nora py-24 max-w-sm mx-auto">
      <h1 className="font-serif text-3xl text-center">{t("admin_login")}</h1>
      <p className="mt-2 text-center text-xs text-charcoal-soft">Demo password: nora-admin</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="text-sm block">
          <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">
            {t("admin_password")}
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-charcoal text-cream px-7 py-3.5 text-sm uppercase tracking-wider hover:bg-charcoal-soft transition-colors disabled:opacity-50"
        >
          {t("admin_sign_in")}
        </button>
      </form>
    </div>
  );
}

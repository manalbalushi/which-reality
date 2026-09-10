"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { Frame } from "@/components/media";
import { UIIcon } from "@/components/icons";
import { CorporateRequest } from "@/lib/types";

const audiences = [
  "Employees",
  "Clients",
  "VIPs",
  "Events",
  "Conferences",
  "Ramadan",
  "Eid",
  "National Occasions",
  "Employee Appreciation",
];

const features = [
  "Bulk Orders",
  "Custom Branding",
  "Company Logo",
  "Personalized Cards",
  "Custom Packaging",
  "Individual Recipient Names",
  "Delivery Coordination",
];

type FormState = Omit<CorporateRequest, "id" | "createdAt" | "status">;

const initialState: FormState = {
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  numberOfGifts: 10,
  budgetPerGift: 20,
  occasion: "",
  preferredDeliveryDate: "",
  message: "",
};

export function CorporateClient() {
  const { t, locale } = useLocale();
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/corporate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
    } catch {
      setError(locale === "ar" ? "حدث خطأ، حاولي مرة أخرى." : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="container-nora py-14 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-4">{t("nav_corporate")}</p>
          <h1 className="font-serif text-4xl sm:text-5xl leading-tight">{t("corporate_hero_title")}</h1>
          <p className="mt-5 text-lg text-charcoal-soft max-w-md">{t("corporate_hero_sub")}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {audiences.map((a) => (
              <span key={a} className="text-xs px-3 py-1.5 rounded-full bg-beige text-charcoal-soft">
                {a}
              </span>
            ))}
          </div>
          <a
            href="#corporate-form"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-charcoal text-cream px-8 py-3.5 text-sm uppercase tracking-wider hover:bg-charcoal-soft transition-colors"
          >
            {t("corporate_teaser_cta")}
          </a>
        </div>
        <Frame
          swatch={{ from: "#eceef2", to: "#ccd3e0", accent: "#2f3b52", icon: "box" }}
          className="aspect-[4/3] w-full"
          iconClassName="w-16 h-16"
        />
      </section>

      <section className="bg-ivory border-y border-line">
        <div className="container-nora py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream border border-line">
                <UIIcon name="check" className="w-4 h-4 text-taupe" />
              </div>
              <p className="text-sm font-medium mt-1.5">{f}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="corporate-form" className="container-nora py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl text-center">{t("corporate_form_title")}</h2>

          {done ? (
            <div className="mt-10 text-center">
              <p className="font-serif text-xl">{t("request_received")}</p>
              <p className="mt-2 text-charcoal-soft">{t("request_received_sub")}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-10 grid sm:grid-cols-2 gap-4">
              <TextField label={t("company_name")} value={form.companyName} onChange={(v) => update("companyName", v)} required />
              <TextField label={t("contact_person")} value={form.contactPerson} onChange={(v) => update("contactPerson", v)} required />
              <TextField label={t("phone")} value={form.phone} onChange={(v) => update("phone", v)} type="tel" required />
              <TextField label={t("email")} value={form.email} onChange={(v) => update("email", v)} type="email" required />
              <TextField
                label={t("number_of_gifts")}
                value={String(form.numberOfGifts)}
                onChange={(v) => update("numberOfGifts", Number(v) || 0)}
                type="number"
              />
              <TextField
                label={t("budget_per_gift")}
                value={String(form.budgetPerGift)}
                onChange={(v) => update("budgetPerGift", Number(v) || 0)}
                type="number"
              />
              <TextField label={t("occasion")} value={form.occasion} onChange={(v) => update("occasion", v)} />
              <TextField
                label={t("preferred_delivery_date")}
                value={form.preferredDeliveryDate}
                onChange={(v) => update("preferredDeliveryDate", v)}
                type="date"
              />
              <label className="text-sm sm:col-span-2">
                <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">
                  {t("message")}
                </span>
                <textarea
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  rows={4}
                  className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
                />
              </label>

              {error && <p className="sm:col-span-2 text-sm text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="sm:col-span-2 mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-charcoal text-cream px-8 py-3.5 text-sm uppercase tracking-wider hover:bg-charcoal-soft transition-colors disabled:opacity-50"
              >
                {submitting ? "…" : t("submit_request")}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-xl px-4 py-3 bg-cream outline-none focus:border-charcoal"
      />
    </label>
  );
}

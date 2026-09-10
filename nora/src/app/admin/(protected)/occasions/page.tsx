"use client";

import { useEffect, useState } from "react";
import { Occasion } from "@/lib/types";

const empty = { nameEn: "", nameAr: "", blurbEn: "", blurbAr: "" };

export default function AdminOccasionsPage() {
  const [items, setItems] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const load = () => fetch("/api/occasions").then((r) => r.json()).then((d) => { setItems(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: { en: form.nameEn, ar: form.nameAr || form.nameEn },
      blurb: { en: form.blurbEn, ar: form.blurbAr || form.blurbEn },
    };
    if (editingId) {
      await fetch(`/api/occasions/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/occasions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setOpen(false);
    setForm(empty);
    setEditingId(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this occasion?")) return;
    await fetch(`/api/occasions/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Occasions</h1>
        <button
          onClick={() => { setForm(empty); setEditingId(null); setOpen((v) => !v); }}
          className="rounded-full bg-charcoal text-cream px-5 py-2.5 text-sm uppercase tracking-wider hover:bg-charcoal-soft"
        >
          {open ? "Cancel" : "Add Occasion"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-8 rounded-2xl border border-line p-5 grid sm:grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">Name (English)</span>
            <input value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} required className="w-full border border-line rounded-xl px-4 py-3 bg-cream" />
          </label>
          <label className="text-sm">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">Name (Arabic)</span>
            <input value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} className="w-full border border-line rounded-xl px-4 py-3 bg-cream" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="block text-xs uppercase tracking-wider text-charcoal-soft mb-2">Blurb (English)</span>
            <input value={form.blurbEn} onChange={(e) => setForm((f) => ({ ...f, blurbEn: e.target.value }))} className="w-full border border-line rounded-xl px-4 py-3 bg-cream" />
          </label>
          <button type="submit" className="sm:col-span-2 rounded-full bg-charcoal text-cream px-6 py-3 text-sm uppercase tracking-wider hover:bg-charcoal-soft w-fit">
            {editingId ? "Save Changes" : "Create Occasion"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-charcoal-soft">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((o) => (
            <div key={o.id} className="rounded-2xl border border-line p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{o.name.en}</p>
                <p className="text-xs text-charcoal-soft">{o.blurb.en}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => { setForm({ nameEn: o.name.en, nameAr: o.name.ar, blurbEn: o.blurb.en, blurbAr: o.blurb.ar }); setEditingId(o.id); setOpen(true); }}
                  className="text-taupe hover:underline"
                >
                  Edit
                </button>
                <button onClick={() => remove(o.id)} className="text-red-700 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

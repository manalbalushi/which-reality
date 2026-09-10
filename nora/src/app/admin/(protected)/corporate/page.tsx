"use client";

import { useEffect, useState } from "react";
import { CorporateRequest } from "@/lib/types";
import { formatOMR } from "@/lib/format";

const statusOptions: CorporateRequest["status"][] = ["New", "Contacted", "Quoted", "Closed"];

export default function AdminCorporatePage() {
  const [requests, setRequests] = useState<CorporateRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/corporate")
      .then((r) => r.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: CorporateRequest["status"]) => {
    const res = await fetch(`/api/corporate/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Corporate Requests</h1>

      {loading ? (
        <p className="text-sm text-charcoal-soft">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-charcoal-soft">No corporate requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-serif text-lg">{r.companyName}</p>
                  <p className="text-sm text-charcoal-soft">
                    {r.contactPerson} · {r.phone} · {r.email}
                  </p>
                </div>
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value as CorporateRequest["status"])}
                  className="border border-line rounded-full px-4 py-1.5 text-sm bg-cream"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <dl className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-charcoal-soft">Number of Gifts</dt><dd>{r.numberOfGifts}</dd></div>
                <div className="flex justify-between"><dt className="text-charcoal-soft">Budget Per Gift</dt><dd>{formatOMR(r.budgetPerGift)}</dd></div>
                <div className="flex justify-between"><dt className="text-charcoal-soft">Occasion</dt><dd>{r.occasion || "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-charcoal-soft">Preferred Delivery</dt><dd>{r.preferredDeliveryDate || "—"}</dd></div>
              </dl>
              {r.message && <p className="mt-3 text-sm text-charcoal-soft italic">“{r.message}”</p>}
              <p className="mt-3 text-xs text-charcoal-soft">
                Submitted {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

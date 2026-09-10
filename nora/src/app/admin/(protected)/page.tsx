"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Order, CorporateRequest } from "@/lib/types";
import { formatOMR } from "@/lib/format";

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [corporate, setCorporate] = useState<CorporateRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/corporate").then((r) => r.json()),
    ]).then(([o, c]) => {
      setOrders(o);
      setCorporate(c);
      setLoading(false);
    });
  }, []);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const newOrders = orders.filter((o) => o.status === "New").length;

  const stats = [
    { label: "Total Orders", value: orders.length },
    { label: "New Orders", value: newOrders },
    { label: "Revenue", value: formatOMR(revenue) },
    { label: "Corporate Requests", value: corporate.length },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Overview</h1>

      {loading ? (
        <p className="text-charcoal-soft text-sm">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-ivory p-5">
                <p className="text-xs uppercase tracking-wider text-charcoal-soft">{s.label}</p>
                <p className="mt-2 font-serif text-2xl">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-taupe hover:underline">
                View all
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-charcoal-soft">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-ivory text-charcoal-soft text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-start px-4 py-3">Order</th>
                      <th className="text-start px-4 py-3">Customer</th>
                      <th className="text-start px-4 py-3">Status</th>
                      <th className="text-start px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 6).map((o) => (
                      <tr key={o.id} className="border-t border-line">
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${o.id}`} className="hover:text-taupe">
                            {o.id}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{o.customer.fullName}</td>
                        <td className="px-4 py-3">{o.status}</td>
                        <td className="px-4 py-3">{formatOMR(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

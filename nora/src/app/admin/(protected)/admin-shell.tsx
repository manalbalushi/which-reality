"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/occasions", label: "Occasions" },
  { href: "/admin/packaging", label: "Packaging" },
  { href: "/admin/corporate", label: "Corporate Requests" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="container-nora py-10 grid lg:grid-cols-[220px_1fr] gap-10">
      <aside>
        <p className="font-serif text-2xl tracking-luxe uppercase mb-1">NORA</p>
        <p className="text-xs text-charcoal-soft mb-6">Admin Dashboard</p>
        <nav className="flex lg:flex-col gap-1 flex-wrap">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-charcoal text-cream" : "hover:bg-beige text-charcoal-soft"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-6 text-xs uppercase tracking-wider text-charcoal-soft hover:text-charcoal underline underline-offset-4"
        >
          Log Out
        </button>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useCart } from "@/lib/cart-context";
import { UIIcon } from "./icons";
import { products } from "@/data/products";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/", key: "nav_home" as const },
  { href: "/shop", key: "nav_shop" as const },
  { href: "/build-your-gift", key: "nav_build" as const },
  { href: "/giveaways", key: "nav_giveaways" as const },
  { href: "/occasions", key: "nav_occasions" as const },
  { href: "/corporate", key: "nav_corporate" as const },
];

export function Header() {
  const { t, locale, setLocale, text } = useLocale();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = query.trim()
    ? products.filter((p) => text(p.name).toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
      <div className="container-nora flex h-20 items-center justify-between gap-4">
        <button
          className="lg:hidden p-2 -ms-2 text-charcoal"
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <UIIcon name={menuOpen ? "close" : "menu"} className="w-6 h-6" />
        </button>

        <Link href="/" className="shrink-0">
          <span className="font-serif text-2xl sm:text-3xl tracking-luxe uppercase">NORA</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[13px] uppercase tracking-wider">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-taupe transition-colors">
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="px-2 py-1 text-xs font-medium tracking-wide border border-line rounded-full hover:bg-beige transition-colors"
            aria-label="Toggle language"
          >
            {locale === "en" ? "عربي" : "EN"}
          </button>
          <button
            className="p-2 hover:text-taupe"
            aria-label={t("nav_search")}
            onClick={() => setSearchOpen(true)}
          >
            <UIIcon name="search" className="w-5 h-5" />
          </button>
          <Link href="/account" className="p-2 hover:text-taupe" aria-label={t("nav_account")}>
            <UIIcon name="user" className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="relative p-2 hover:text-taupe" aria-label={t("nav_cart")}>
            <UIIcon name="cart" className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-charcoal text-[10px] text-cream">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-line bg-cream px-5 py-4 flex flex-col gap-4 text-sm uppercase tracking-wider">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {t(item.key)}
            </Link>
          ))}
        </nav>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-charcoal/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div
            className="mx-auto mt-24 w-[92%] max-w-xl rounded-2xl bg-cream p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={submitSearch} className="flex items-center gap-3 border-b border-line pb-3">
              <UIIcon name="search" className="w-5 h-5 text-taupe" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("nav_search")}
                className="flex-1 bg-transparent outline-none text-lg font-serif"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close">
                <UIIcon name="close" className="w-5 h-5" />
              </button>
            </form>
            {results.length > 0 && (
              <ul className="mt-3 divide-y divide-line">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/shop/${p.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between py-3 text-sm hover:text-taupe"
                    >
                      <span>{text(p.name)}</span>
                      <span className="text-charcoal-soft">OMR {p.price.toFixed(3)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

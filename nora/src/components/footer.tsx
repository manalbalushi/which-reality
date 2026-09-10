"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { UIIcon } from "./icons";

const seoLinks = [
  "Gifts in Oman",
  "Gift Boxes Oman",
  "Luxury Gifts Oman",
  "Corporate Gifts Oman",
  "Birthday Gifts Oman",
  "Eid Gifts Oman",
  "Ramadan Gifts Oman",
  "Personalized Gifts Oman",
  "Gift Delivery Oman",
];

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-line bg-ivory mt-20">
      <div className="container-nora py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-serif text-2xl tracking-luxe uppercase">Noola</span>
          <p className="mt-3 text-sm text-charcoal-soft max-w-xs">{t("tagline")}</p>
          <a
            href="https://wa.me/96890000000"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium hover:text-taupe"
          >
            <UIIcon name="whatsapp" className="w-4 h-4" />
            {t("footer_help")}
          </a>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-charcoal-soft mb-4">{t("nav_shop")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-taupe">{t("nav_shop")}</Link></li>
            <li><Link href="/build-your-gift" className="hover:text-taupe">{t("nav_build")}</Link></li>
            <li><Link href="/occasions" className="hover:text-taupe">{t("nav_occasions")}</Link></li>
            <li><Link href="/corporate" className="hover:text-taupe">{t("nav_corporate")}</Link></li>
            <li><Link href="/cart" className="hover:text-taupe">{t("nav_cart")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-charcoal-soft mb-4">Oman</h4>
          <ul className="space-y-2 text-sm text-charcoal-soft">
            <li>Muscat, Sultanate of Oman</li>
            <li>hello@noola-gifts.om</li>
            <li>+968 9000 0000</li>
            <li><Link href="/admin" className="hover:text-taupe">Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-charcoal-soft mb-4">Explore</h4>
          <ul className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-charcoal-soft">
            {seoLinks.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-charcoal-soft">
        © {new Date().getFullYear()} Noola. {t("footer_rights")}
      </div>
    </footer>
  );
}

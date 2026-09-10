"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

export default function AccountPage() {
  const { locale } = useLocale();
  return (
    <div className="container-nora py-24 max-w-md text-center">
      <h1 className="font-serif text-3xl">{locale === "ar" ? "حسابي" : "My Account"}</h1>
      <p className="mt-3 text-charcoal-soft">
        {locale === "ar"
          ? "تسجيل دخول العملاء متوفر قريباً. يمكنك متابعة طلباتك عبر واتساب أو البريد الإلكتروني."
          : "Customer accounts are coming soon. For now, track your order via WhatsApp or email."}
      </p>
      <Link href="/admin" className="mt-8 inline-block text-sm underline underline-offset-4 text-taupe">
        {locale === "ar" ? "هل أنت صاحب المتجر؟ الذهاب إلى لوحة التحكم" : "Business owner? Go to Admin Dashboard"}
      </Link>
    </div>
  );
}

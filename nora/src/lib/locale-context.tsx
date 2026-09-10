"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Locale } from "./types";
import { DictKey, t } from "./i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
  t: (key: DictKey) => string;
  text: (value: { en: string; ar: string }) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("nora-locale") as Locale | null;
    if (stored === "en" || stored === "ar") {
      // Deferred to after mount so the client's first render matches the server (no localStorage during SSR).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem("nora-locale", next);
  };

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: (key: DictKey) => t(locale, key),
      text: (value: { en: string; ar: string }) => value[locale],
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

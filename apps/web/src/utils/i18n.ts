export type Locale = "en" | "fr";

const STORAGE_KEY = "locale";

export const defaultLocale: Locale = "en";

export function getStoredLocale(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "en" || v === "fr") return v;
  } catch {}
  try {
    const m = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    const v = m ? decodeURIComponent(m[1]) : null;
    if (v === "en" || v === "fr") return v;
  } catch {}
  return defaultLocale;
}

export function setStoredLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {}
  try {
    document.cookie = `locale=${encodeURIComponent(locale)}; path=/; max-age=${60 * 60 * 24 * 365}`;
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent("i18n:locale", { detail: { locale } }));
  } catch {}
}

// Statically import dictionaries for reliability in client components
// Next.js bundles JSON imports automatically
import en from "../i18n/en.json";
import fr from "../i18n/fr.json";

const dict: Record<Locale, Record<string, string>> = { en, fr } as any;

export function translate(locale: Locale, key: string): string {
  return dict[locale]?.[key] ?? dict[defaultLocale]?.[key] ?? key;
}


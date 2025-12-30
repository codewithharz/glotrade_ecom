export type Locale = "en" | "fr" | "es" | "zh" | "ar" | "ha";

const STORAGE_KEY = "locale";

export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "fr", "es", "zh", "ar", "ha"];

export const languageNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  zh: "简体中文",
  ar: "العربية",
  ha: "Hausa",
};

export const isRTLStatus: Record<Locale, boolean> = {
  en: false,
  fr: false,
  es: false,
  zh: false,
  ar: true,
  ha: false,
};

export function getStoredLocale(): Locale {
  try {
    const v = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (locales.includes(v as Locale)) return v as Locale;
  } catch { }
  try {
    const m = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )locale=([^;]+)/) : null;
    const v = m ? decodeURIComponent(m[1]) : null;
    if (locales.includes(v as Locale)) return v as Locale;
  } catch { }
  return defaultLocale;
}

export function setStoredLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch { }
  try {
    document.cookie = `locale=${encodeURIComponent(locale)}; path=/; max-age=${60 * 60 * 24 * 365}`;
  } catch { }
  try {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = isRTLStatus[locale] ? "rtl" : "ltr";
    }
    window.dispatchEvent(new CustomEvent("i18n:locale", { detail: { locale } }));
  } catch { }

  // Refresh to apply RTL changes globally if needed, 
  // or handle dynamically via event.
}

// Statically import dictionaries
import en from "../i18n/en.json";
import fr from "../i18n/fr.json";
import es from "../i18n/es.json";
import zh from "../i18n/zh.json";
import ar from "../i18n/ar.json";
import ha from "../i18n/ha.json";

const dict: Record<Locale, any> = { en, fr, es, zh, ar, ha };

export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const keys = key.split(".");
  let value: any = dict[locale];
  for (const k of keys) {
    if (value && typeof value === "object") {
      value = value[k];
    } else {
      value = undefined;
      break;
    }
  }

  if (value === undefined) {
    let fallback: any = dict[defaultLocale];
    for (const k of keys) {
      if (fallback && typeof fallback === "object") {
        fallback = fallback[k];
      } else {
        fallback = undefined;
        break;
      }
    }
    value = fallback;
  }

  let result = typeof value === "string" ? value : key;

  if (params && result) {
    Object.entries(params).forEach(([k, v]) => {
      result = result.replace(new RegExp(`{${k}}`, "g"), String(v));
    });
  }

  return result;
}


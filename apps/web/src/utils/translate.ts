import { getStoredLocale, translate as baseTranslate } from "./i18n";

/**
 * Client-side translation utility that automatically uses the current stored locale.
 * @param key The translation key (e.g., 'wallet.title')
 * @param params Optional parameters for string interpolation
 * @returns The translated string or the key if not found
 */
export function translate(key: string, params?: Record<string, string | number>): string {
    const locale = getStoredLocale();
    return baseTranslate(locale, key, params);
}

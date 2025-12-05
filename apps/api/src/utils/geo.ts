export const Countries = [
  { code: "NG", name: "Nigeria", currencies: ["NGN", "ATH"], defaultCurrency: "NGN" },
  { code: "GH", name: "Ghana", currencies: ["GHS", "ATH"], defaultCurrency: "GHS" },
  { code: "CI", name: "Côte d’Ivoire", currencies: ["XOF", "ATH"], defaultCurrency: "XOF" },
  { code: "KE", name: "Kenya", currencies: ["KES", "ATH"], defaultCurrency: "KES" },
  { code: "ZA", name: "South Africa", currencies: ["ZAR", "ATH"], defaultCurrency: "ZAR" },
];

export function isSupportedCountry(code: string): boolean {
  return Countries.some((c) => c.code === code);
}

export function getDefaultCurrency(code: string): string | undefined {
  return Countries.find((c) => c.code === code)?.defaultCurrency;
}


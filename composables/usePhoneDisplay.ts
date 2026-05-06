// Source unique : detection des telephones placeholder.
// Tant que la valeur env / Sanity n'est pas remplacee par un vrai numero,
// les composants doivent cacher le bloc telephone (mieux que d'afficher
// "+33 4 00 00 00 00" qui detruit la confiance sur un site de luxe).
//
// Patterns detectes :
//  - chaine vide / undefined
//  - "+33 4 00 ..." ou "+33 6 00 ..." (placeholder masque ranges)
//  - "33493000000" (placeholder ancien fallback nuxt.config)
//  - "33400000000" (placeholder fallback variant)
//  - "tel:+33400000000" (placeholder href)
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /^$/,
  /^\+33\s*4\s*00\s/,
  /^\+33\s*6\s*00\s/,
  /^33493000000$/,
  /^33400000000$/,
  /^tel:\+?3340000000\d?$/,
  /^tel:\+?3349300000\d?$/,
];

export function isPhonePlaceholder(value: string | undefined | null): boolean {
  if (!value) return true;
  const v = String(value).trim();
  if (!v) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(v));
}

// Helper render : retourne null si placeholder, sinon objet { display, href }.
export type PhoneEntry = { display: string; href: string };
export function resolvePhone(display?: string, href?: string): PhoneEntry | null {
  if (isPhonePlaceholder(display) || isPhonePlaceholder(href)) return null;
  return { display: String(display).trim(), href: String(href).trim() };
}

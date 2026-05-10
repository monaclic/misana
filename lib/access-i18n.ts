// Dictionnaire FR -> EN pour les champs scrapes Excellence Riviera
// (cuisineType, ambiance, establishmentType, shortLine derivee).
// Le scraper a copie le FR brut dans les deux locales : on repercute la
// traduction cote adapter quand la locale active est EN.

const CUISINE_FR_EN: Record<string, string> = {
  'Argentine': 'Argentinian',
  'Asiatique': 'Asian',
  'Méditerranéenne': 'Mediterranean',
  'Péruvienne': 'Peruvian',
  'Française': 'French',
  'Italienne': 'Italian',
  'Internationale': 'International',
  'Grecque': 'Greek',
  'Japonais': 'Japanese',
  'Japonaise': 'Japanese',
  'Mexicaine': 'Mexican',
  'Marocaine': 'Moroccan',
  'Espagnole': 'Spanish',
};

const AMBIANCE_FR_EN: Record<string, string> = {
  'Élegante & raffinée': 'Elegant & refined',
  'Élégante & raffinée': 'Elegant & refined',
  'Chic & décontractée': 'Chic & casual',
  'Festive': 'Lively',
  'Musique live': 'Live music',
  'Ouvert le soir': 'Open in the evening',
  'Familiale': 'Family',
  'Sunset': 'Sunset',
  'Romantique': 'Romantic',
  'Calme & intime': 'Quiet & intimate',
  'Décontractée': 'Casual',
};

const ESTABLISHMENT_TYPE_FR_EN: Record<string, string> = {
  'Restaurant': 'Restaurant',
  'Boîte de Nuit': 'Nightclub',
  'Bar Festif': 'Lively bar',
  'Restaurant Festif': 'Lively restaurant',
  'Plage Privée': 'Private beach',
  'Plage Privée Festive': 'Lively private beach',
  'Restaurant d’Hôtel': 'Hotel restaurant',
  "Restaurant d'Hôtel": 'Hotel restaurant',
  'Hôtel': 'Hotel',
  'Brasserie': 'Brasserie',
  'Bar à Cocktails': 'Cocktail bar',
};

const ALL_TERMS: Record<string, string> = {
  ...CUISINE_FR_EN,
  ...AMBIANCE_FR_EN,
  ...ESTABLISHMENT_TYPE_FR_EN,
};

// Traduit une string FR vers EN en cascade :
// 1) exact match full string
// 2) split sur ", " (separateur typique des champs Excellence) + translate par token
// 3) fallback : retourne la string FR telle quelle (preferable a un placeholder vide)
export function translateAccessTerm(input: string | undefined | null): string {
  if (!input) return input ?? '';
  if (ALL_TERMS[input]) return ALL_TERMS[input];
  if (input.includes(', ')) {
    return input.split(', ').map((p) => ALL_TERMS[p.trim()] ?? p).join(', ');
  }
  return input;
}

// Traduit un tableau (cuisineType[] ou ambiance[]) en gardant les inconnus.
export function translateAccessTerms(items: string[] | undefined | null): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((s) => ALL_TERMS[s] ?? s);
}

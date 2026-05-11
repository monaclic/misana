// llms.txt - standard emergent (Jeremy Howard / FastAI) qui fournit aux
// LLMs un resume markdown structure du site. Permet a ChatGPT, Claude,
// Perplexity etc. d'ingerer rapidement la structure et la promesse de
// Misana sans avoir a crawler 76 pages HTML.
//
// Format : H1 titre, blockquote resume, sections H2 avec liens en
// `- [Titre](URL): description`.
//
// Spec : https://llmstxt.org

import { createClient } from '@sanity/client';

const SITE_URL = 'https://misana-group.com';

type Fiche = {
  slug: string;
  name: string;
  category: 'restaurant' | 'beach-club' | 'palace' | 'nightclub';
  city: string;
  shortLineEn?: string;
};

const sanityClient = createClient({
  projectId: 'akpi9bfm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const CITY_LABELS: Record<string, string> = {
  'saint-tropez': 'Saint-Tropez',
  'ramatuelle': 'Ramatuelle',
  'antibes': 'Antibes',
  'cap-d-antibes': "Cap d'Antibes",
  'cannes': 'Cannes',
  'cap-ferrat': 'Cap-Ferrat',
  'nice': 'Nice',
  'eze': 'Èze',
  'monaco': 'Monaco',
  'menton': 'Menton',
};

function ficheLine(f: Fiche): string {
  const url = `${SITE_URL}/en/reservations/${f.slug}`;
  const city = CITY_LABELS[f.city] || f.city;
  const desc = f.shortLineEn ? `${f.shortLineEn}, ${city}` : city;
  return `- [${f.name}](${url}): ${desc}`;
}

export default defineEventHandler(async (event) => {
  let fiches: Fiche[] = [];
  try {
    fiches = await sanityClient.fetch<Fiche[]>(
      `*[_type == "accessEstablishment" && published == true] | order(category asc, name asc) {
        "slug": slug.current,
        name,
        category,
        city,
        "shortLineEn": shortLine.en
      }`,
    );
  } catch (err) {
    console.error('[llms.txt] Sanity fetch failed:', err);
  }

  const restaurants = fiches.filter((f) => f.category === 'restaurant');
  const beachClubs = fiches.filter((f) => f.category === 'beach-club');
  const palaces = fiches.filter((f) => f.category === 'palace');
  const nightclubs = fiches.filter((f) => f.category === 'nightclub');

  const sections: string[] = [];

  sections.push('# Misana');
  sections.push('');
  sections.push('> Private services on the French Riviera. Chauffeur, car rental, yacht charter, helicopter transfers and direct reservations at restaurants, beach clubs and nightclubs from Saint-Tropez to Monaco. Operated by Antoura Holdings Ltd (company number 16434396, England and Wales).');
  sections.push('');
  sections.push('Misana orchestrates private services on the 80 kilometres of coastline between Saint-Tropez and Menton. One contact, one quotation, end-to-end coordination. Reply within 30 minutes during business hours. Website in English and French (/en/ and /fr/ prefixes).');
  sections.push('');

  sections.push('## Services');
  sections.push('');
  sections.push(`- [Private chauffeur](${SITE_URL}/en/private-chauffeur): Private chauffeur service on the French Riviera. Mercedes E-Class, V-Class, S-Class, Range Rover Vogue, Maybach S 680, Mercedes Sprinter. Airport transfers and on-demand disposal.`);
  sections.push(`- [Car rental](${SITE_URL}/en/car-rental): Luxury car rental on the French Riviera. Supercars, grand tourers, SUVs and convertibles delivered to your address.`);
  sections.push(`- [Yacht charter](${SITE_URL}/en/yacht-charter): Day and week yacht charter. From 15 to 50+ metres, crew included. Departure from Cannes, Monaco, Saint-Tropez, Antibes.`);
  sections.push(`- [Helicopter transfer](${SITE_URL}/en/helicopter-transfer): Helicopter transfers between Saint-Tropez, Cannes, Nice and Monaco. 20 minutes per route. Mercedes V-Class chauffeur included at each end.`);
  sections.push(`- [Reservations](${SITE_URL}/en/reservations): Direct booking at restaurants, beach clubs, hotels and nightclubs on the French Riviera. Request sent directly to the venue. Reply within 30 minutes.`);
  sections.push('');

  if (restaurants.length) {
    sections.push('## Restaurants');
    sections.push('');
    for (const f of restaurants) sections.push(ficheLine(f));
    sections.push('');
  }

  if (beachClubs.length) {
    sections.push('## Beach clubs');
    sections.push('');
    for (const f of beachClubs) sections.push(ficheLine(f));
    sections.push('');
  }

  if (palaces.length) {
    sections.push('## Hotels');
    sections.push('');
    for (const f of palaces) sections.push(ficheLine(f));
    sections.push('');
  }

  if (nightclubs.length) {
    sections.push('## Nightlife');
    sections.push('');
    for (const f of nightclubs) sections.push(ficheLine(f));
    sections.push('');
  }

  sections.push('## Coverage');
  sections.push('');
  sections.push('Geographic scope: 80 kilometres of coastline between Saint-Tropez and Menton (French Riviera). Cities covered: Saint-Tropez, Ramatuelle, Antibes, Cap d\'Antibes, Cannes, Cap-Ferrat, Nice, Èze, Monaco, Menton. No service outside this perimeter.');
  sections.push('');

  sections.push('## Contact');
  sections.push('');
  sections.push('- Email: contact@misana-group.com');
  sections.push('- Address: Antoura Holdings Ltd, 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom');
  sections.push('');

  sections.push('## Optional');
  sections.push('');
  sections.push(`- [Sitemap (XML)](${SITE_URL}/sitemap.xml): Full list of indexed pages.`);
  sections.push(`- [French version](${SITE_URL}/fr): Same content in French.`);

  const body = sections.join('\n') + '\n';

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return body;
});

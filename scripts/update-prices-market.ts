// Realigne les prix de 8 fiches voitures sur le marche Cote d'Azur saison.
// Positionnement Misana : smart premium, legerement sous mediane marche.
import { client } from './sanity-migrate/_client';

type PriceTier = { oneToThreeDays: number; fourToSevenDays: number; weekPlus: number };

const UPDATES: { id: string; slug: string; prices: PriceTier }[] = [
  { id: '0rSVUGWjvFA7oUJDSg3UTG', slug: 'mercedes-classe-g63-amg',     prices: { oneToThreeDays: 1150, fourToSevenDays: 1000, weekPlus: 850 } },
  { id: '0rSVUGWjvFA7oUJDSg3UeU', slug: 'mercedes-sl-63-amg-roadster', prices: { oneToThreeDays: 950,  fourToSevenDays: 850,  weekPlus: 750 } },
  { id: 'GJusG3cF3viLZ1vVgVpnW7', slug: 'ferrari-296-gts',             prices: { oneToThreeDays: 2050, fourToSevenDays: 1800, weekPlus: 1600 } },
  { id: 'GJusG3cF3viLZ1vVgVpptb', slug: 'mercedes-gle-53-amg',         prices: { oneToThreeDays: 650,  fourToSevenDays: 550,  weekPlus: 500 } },
  { id: 'JxhUtlLptLidCGOeICuwHh', slug: 'mercedes-maybach-gls-600',    prices: { oneToThreeDays: 1500, fourToSevenDays: 1300, weekPlus: 1150 } },
  { id: 'JxhUtlLptLidCGOeICuybv', slug: 'land-rover-defender-bodykit', prices: { oneToThreeDays: 850,  fourToSevenDays: 750,  weekPlus: 650 } },
  { id: 'xzJHDkjaEEloDSSKMsGOks', slug: 'porsche-911-gt3-rs',          prices: { oneToThreeDays: 2200, fourToSevenDays: 1900, weekPlus: 1700 } },
  { id: 'xzJHDkjaEEloDSSKMsGPMU', slug: 'range-rover-sport',           prices: { oneToThreeDays: 650,  fourToSevenDays: 550,  weekPlus: 500 } },
];

async function main() {
  for (const u of UPDATES) {
    console.log(`→ Patch ${u.slug} (${u.id})`);
    await client.patch(u.id).set({ prices: u.prices }).commit();
    console.log(`  OK ${u.prices.oneToThreeDays} / ${u.prices.fourToSevenDays} / ${u.prices.weekPlus}`);
  }
  console.log(`\n✓ ${UPDATES.length} fiches mises a jour.`);
}

main().catch((e) => { console.error(e); process.exit(1); });

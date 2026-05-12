// Floute les plaques detectees et convertit toutes les images du
// catalogue en WebP. Couvre :
// - 177 images fleet-raw (FLM + Perf-GT) avec 2 plaques sur Classe S
// - 14 photos Yassine (Purosangue + Defender bodykit) avec coords connues
//
// Output : /Users/nayar/Desktop/misana-v2/fleet-processed/[slug]/[index].webp
//
// Usage : pnpm tsx scripts/fleet-process.ts

import sharp from 'sharp';
import { mkdir, readdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const RAW_DIR = '/Users/nayar/Desktop/misana-v2/fleet-raw';
const YASSINE_DIR = '/Users/nayar/Desktop/misana-v2/voiture yassine';
const OUT_DIR = '/Users/nayar/Desktop/misana-v2/fleet-processed';

type Plate = { left: number; top: number; width: number; height: number };

// === FLEET-RAW : plaques detectees par l'agent ===
const FLEET_PLATES: Record<string, Plate[]> = {
  'mercedes-classe-s/03.jpeg': [{ left: 160, top: 270, width: 90, height: 40 }],
  'mercedes-classe-s/04.jpeg': [{ left: 235, top: 210, width: 85, height: 45 }],
};

// === YASSINE : mapping photo -> fiche + plaques connues ===
// Plaques issues du JSON detecte en session precedente.
type YassineEntry = { source: string; targetSlug: string; index: number; plates: Plate[] };

const YASSINE_MAPPING: YassineEntry[] = [
  // Ferrari Purosangue (hero = 26-7, puis ordre validé)
  { source: 'WhatsApp Image 2026-05-11 at 18.28.26 (7).jpeg', targetSlug: 'ferrari-purosangue', index: 0, plates: [] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.25 (6).jpeg', targetSlug: 'ferrari-purosangue', index: 1, plates: [] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.26 (5).jpeg', targetSlug: 'ferrari-purosangue', index: 2, plates: [{ left: 1640, top: 800, width: 320, height: 130 }] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.26 (6).jpeg', targetSlug: 'ferrari-purosangue', index: 3, plates: [{ left: 200, top: 870, width: 320, height: 130 }] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.26 (8).jpeg', targetSlug: 'ferrari-purosangue', index: 4, plates: [{ left: 1480, top: 870, width: 320, height: 130 }] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.26 (9).jpeg', targetSlug: 'ferrari-purosangue', index: 5, plates: [] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.27 (1).jpeg', targetSlug: 'ferrari-purosangue', index: 6, plates: [] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.27.jpeg', targetSlug: 'ferrari-purosangue', index: 7, plates: [] },
  // Land Rover Defender Bodykit
  { source: 'WhatsApp Image 2026-05-11 at 18.28.27 (6).jpeg', targetSlug: 'land-rover-defender-bodykit', index: 0, plates: [{ left: 60, top: 940, width: 320, height: 130 }] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.27 (8).jpeg', targetSlug: 'land-rover-defender-bodykit', index: 1, plates: [{ left: 1480, top: 1080, width: 280, height: 120 }, { left: 30, top: 540, width: 140, height: 70 }] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.27 (9).jpeg', targetSlug: 'land-rover-defender-bodykit', index: 2, plates: [] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.28 (7).jpeg', targetSlug: 'land-rover-defender-bodykit', index: 3, plates: [] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.28 (9).jpeg', targetSlug: 'land-rover-defender-bodykit', index: 4, plates: [{ left: 90, top: 1090, width: 320, height: 130 }] },
  { source: 'WhatsApp Image 2026-05-11 at 18.28.28.jpeg', targetSlug: 'land-rover-defender-bodykit', index: 5, plates: [{ left: 80, top: 1020, width: 320, height: 130 }] },
];

function clamp(p: Plate, w: number, h: number): Plate | null {
  const left = Math.max(0, Math.min(p.left, w - 1));
  const top = Math.max(0, Math.min(p.top, h - 1));
  const width = Math.max(1, Math.min(p.width, w - left));
  const height = Math.max(1, Math.min(p.height, h - top));
  if (width < 5 || height < 5) return null;
  return { left, top, width, height };
}

async function blurPlatesAndWebp(input: string, output: string, plates: Plate[]) {
  if (plates.length === 0) {
    await sharp(input).webp({ quality: 92 }).toFile(output);
    return;
  }
  const meta = await sharp(input).metadata();
  const w = meta.width!;
  const h = meta.height!;
  const composites: sharp.OverlayOptions[] = [];
  for (const raw of plates) {
    const region = clamp(raw, w, h);
    if (!region) continue;
    const blurred = await sharp(input).extract(region).blur(20).toBuffer();
    composites.push({ input: blurred, left: region.left, top: region.top });
  }
  await sharp(input).composite(composites).webp({ quality: 92 }).toFile(output);
}

async function processFleet() {
  console.log('=== FLEET-RAW (FLM + Perf-GT) ===');
  const slugs = await readdir(RAW_DIR);
  let count = 0;
  let blurred = 0;
  for (const slug of slugs) {
    const slugDir = join(RAW_DIR, slug);
    const outSlugDir = join(OUT_DIR, slug);
    await mkdir(outSlugDir, { recursive: true });
    const files = (await readdir(slugDir)).filter((f) => !f.startsWith('.'));
    for (const f of files) {
      const input = join(slugDir, f);
      const stem = basename(f, extname(f));
      const output = join(outSlugDir, `${stem}.webp`);
      const key = `${slug}/${f}`;
      const plates = FLEET_PLATES[key] || [];
      try {
        await blurPlatesAndWebp(input, output, plates);
        count++;
        if (plates.length > 0) blurred++;
      } catch (e: any) {
        console.log(`X ${key} ${e.message}`);
      }
    }
  }
  console.log(`Fleet : ${count} fichiers traites, ${blurred} avec floutage`);
}

async function processYassine() {
  console.log('\n=== YASSINE (Purosangue + Defender Bodykit) ===');
  let count = 0;
  let blurred = 0;
  // Groupe par target slug
  const bySlug: Record<string, YassineEntry[]> = {};
  for (const e of YASSINE_MAPPING) {
    if (!bySlug[e.targetSlug]) bySlug[e.targetSlug] = [];
    bySlug[e.targetSlug].push(e);
  }

  for (const slug of Object.keys(bySlug)) {
    const outSlugDir = join(OUT_DIR, slug);
    await mkdir(outSlugDir, { recursive: true });
    for (const e of bySlug[slug]) {
      const input = join(YASSINE_DIR, e.source);
      if (!existsSync(input)) {
        console.log(`X ${slug} index ${e.index} : source manquante ${e.source}`);
        continue;
      }
      const output = join(outSlugDir, `${e.index.toString().padStart(2, '0')}.webp`);
      try {
        await blurPlatesAndWebp(input, output, e.plates);
        count++;
        if (e.plates.length > 0) blurred++;
      } catch (err: any) {
        console.log(`X ${slug} index ${e.index} : ${err.message}`);
      }
    }
  }
  console.log(`Yassine : ${count} fichiers traites, ${blurred} avec floutage`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await processFleet();
  await processYassine();
  console.log('\nFini.');
}

main().catch((e) => { console.error(e); process.exit(1); });

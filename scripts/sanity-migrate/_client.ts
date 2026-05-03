// Client Sanity partage par tous les scripts de migration.
// Necessite SANITY_AUTH_TOKEN dans .env.local (token avec perm Editor).
import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Charge .env.local en priorite (preferred), sinon .env.
const local = resolve(process.cwd(), '.env.local');
config({ path: existsSync(local) ? local : undefined });

const projectId = process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || 'akpi9bfm';
const dataset = process.env.NUXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NUXT_PUBLIC_SANITY_API_VERSION || '2026-04-26';
const token = process.env.SANITY_AUTH_TOKEN;

if (!token) {
  throw new Error(
    'SANITY_AUTH_TOKEN manquant. Ajoute-le dans .env.local. ' +
      'Token avec permission Editor sur https://www.sanity.io/manage',
  );
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// Upload une image depuis une URL externe et renvoie son _id Sanity asset.
export async function uploadImageFromUrl(url: string, filename?: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Echec download ${url} : ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const name = filename || url.split('/').pop() || 'image.jpg';
  const asset = await client.assets.upload('image', buf, { filename: name });
  return asset._id;
}

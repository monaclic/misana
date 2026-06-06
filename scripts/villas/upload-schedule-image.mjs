// Upload one-shot de l'image du bloc "Planifier un appel" (fiches villas)
// sur Sanity, et affiche l'URL CDN de l'asset.
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

// Charge SANITY_AUTH_TOKEN depuis .env.local (parse minimal, sans guillemets).
const env = readFileSync(new URL('../../.env.local', import.meta.url), 'utf8');
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1] || '').trim().replace(/^["']|["']$/g, '');

const client = createClient({
  projectId: 'akpi9bfm',
  dataset: 'production',
  apiVersion: '2026-04-26',
  token: get('SANITY_AUTH_TOKEN'),
  useCdn: false,
});

const path = '/Users/nayar/Downloads/1768221574764.jpeg';
const buf = readFileSync(path);
const asset = await client.assets.upload('image', buf, { filename: 'villa-schedule-call.jpeg' });
console.log('ASSET_URL=' + asset.url);

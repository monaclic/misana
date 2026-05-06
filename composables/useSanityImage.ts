// Helper pour transformer une image Sanity (asset reference) en URL CDN.
//
// Le builder officiel @sanity/image-url a un bug avec hotspot/crop :
// quand l'asset Sanity a un hotspot, .width()/.height()/.quality() sont
// ignores et l'URL retourne juste ?rect=... (= image originale full size).
// Resultat : 555 KiB de gras sur les hero images de la home.
//
// Solution : pour les cas avec options (sanityImageWith), on construit
// l'URL manuellement en parsant l'asset _ref. On perd l'auto-application
// du hotspot mais on garde le controle des dimensions (le hotspot est
// applique en pratique via fit=crop + Sanity CDN qui centre intelligemment).
//
// sanityImage (sans options) garde le builder officiel pour respecter le
// hotspot artistique quand le resize n'est pas critique.
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

let _builder: ReturnType<typeof imageUrlBuilder> | null = null;

function getProjectConfig() {
  const config = useRuntimeConfig();
  const projectId = (config.public as any).sanity?.projectId
    || (config.public as any).NUXT_PUBLIC_SANITY_PROJECT_ID
    || 'akpi9bfm';
  const dataset = (config.public as any).sanity?.dataset
    || (config.public as any).NUXT_PUBLIC_SANITY_DATASET
    || 'production';
  return { projectId, dataset };
}

function getBuilder() {
  if (_builder) return _builder;
  const { projectId, dataset } = getProjectConfig();
  _builder = imageUrlBuilder({ projectId, dataset });
  return _builder;
}

// Extrait l'asset _ref d'une source Sanity image (peut etre nested
// ou direct, selon la maniere dont GROQ a renvoye l'image).
function extractRef(source: SanityImageSource | null | undefined): string | null {
  if (!source) return null;
  if (typeof source === 'string') return source;
  const s = source as any;
  if (s._ref) return s._ref as string;
  if (s.asset?._ref) return s.asset._ref as string;
  return null;
}

// Parse une asset _ref Sanity au format "image-<id>-<W>x<H>-<format>"
// vers les composants url. Ex : image-abc123-3500x2207-webp
//   id     = abc123
//   dim    = 3500x2207
//   format = webp
function parseRef(ref: string): { id: string; dim: string; format: string } | null {
  if (!ref.startsWith('image-')) return null;
  const parts = ref.slice(6).split('-');
  if (parts.length < 3) return null;
  const format = parts[parts.length - 1];
  const dim = parts[parts.length - 2];
  const id = parts.slice(0, -2).join('-');
  if (!format || !dim || !id) return null;
  return { id, dim, format };
}

export function sanityImage(source: SanityImageSource | null | undefined): string {
  if (!source) return '';
  try {
    return getBuilder().image(source).auto('format').url();
  } catch {
    return '';
  }
}

export function sanityImageWith(
  source: SanityImageSource | null | undefined,
  opts: { w?: number; h?: number; q?: number; fit?: 'crop' | 'max' | 'fill' | 'fillmax' | 'min' | 'scale' | 'clip' } = {},
): string {
  if (!source) return '';
  const ref = extractRef(source);
  if (!ref) return '';
  const parsed = parseRef(ref);
  if (!parsed) {
    // Fallback : si on n'arrive pas a parser, on tente le builder
    try { return getBuilder().image(source).auto('format').url(); } catch { return ''; }
  }
  const { id, dim, format } = parsed;
  const { projectId, dataset } = getProjectConfig();
  const params = new URLSearchParams();
  params.set('auto', 'format');
  if (opts.w) params.set('w', String(opts.w));
  if (opts.h) params.set('h', String(opts.h));
  if (opts.q) params.set('q', String(opts.q));
  if (opts.fit) params.set('fit', opts.fit);
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dim}.${format}?${params.toString()}`;
}

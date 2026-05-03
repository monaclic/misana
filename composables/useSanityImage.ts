// Helper pour transformer une image Sanity (asset reference) en URL CDN.
// Avec hotspot et resize en parametre. Renvoie une string vide si null.
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

let _builder: ReturnType<typeof imageUrlBuilder> | null = null;

function getBuilder() {
  if (_builder) return _builder;
  const config = useRuntimeConfig();
  _builder = imageUrlBuilder({
    projectId: (config.public as any).sanity?.projectId
      || (config.public as any).NUXT_PUBLIC_SANITY_PROJECT_ID
      || 'akpi9bfm',
    dataset: (config.public as any).sanity?.dataset
      || (config.public as any).NUXT_PUBLIC_SANITY_DATASET
      || 'production',
  });
  return _builder;
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
  opts: { w?: number; h?: number; q?: number } = {},
): string {
  if (!source) return '';
  try {
    let b = getBuilder().image(source).auto('format');
    if (opts.w) b = b.width(opts.w);
    if (opts.h) b = b.height(opts.h);
    if (opts.q) b = b.quality(opts.q);
    return b.url();
  } catch {
    return '';
  }
}

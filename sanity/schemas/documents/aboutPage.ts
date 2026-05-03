// Singleton de la page About. La copy editoriale specifique (titres,
// sous-titres, corps, milestones, etc.) reste en i18n V1. On expose
// uniquement les images + overrides SEO + sections libres.
//
// Permet a l'associee de :
// - Changer toutes les images de la page (hero, philosophy, spaces, cta, ticker)
// - Override le hero lead et le CTA body en pleine voix
// - Editer le SEO
// - Ajouter des sections editoriales libres en bas de page (avant le CTA)
import { defineType, defineField } from 'sanity';
import { SECTION_BLOCKS } from '../objects/blocks';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'Page About',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'philosophy', title: 'Philosophy' },
    { name: 'spaces', title: 'Spaces' },
    { name: 'gallery', title: 'Galerie ticker' },
    { name: 'cta', title: 'CTA bottom' },
    { name: 'sections', title: 'Sections libres' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // --- HERO ---
    defineField({ name: 'heroImage', type: 'image', group: 'hero',
      title: 'Image hero (full-bleed)', options: { hotspot: true } }),
    defineField({ name: 'heroLeadOverride', type: 'localizedText', group: 'hero',
      title: 'Lead hero override (laisser vide pour traduction i18n)' }),

    // --- PHILOSOPHY ---
    defineField({ name: 'philosophyImage', type: 'image', group: 'philosophy',
      title: 'Image bas de section philosophy', options: { hotspot: true } }),

    // --- SPACES (mosaic 2 images) ---
    defineField({ name: 'spacesLeftImage', type: 'image', group: 'spaces',
      title: 'Image gauche (3:4 portrait)', options: { hotspot: true } }),
    defineField({ name: 'spacesRightImage', type: 'image', group: 'spaces',
      title: 'Image droite (2:3 portrait)', options: { hotspot: true } }),

    // --- GALLERY (ticker horizontal) ---
    defineField({
      name: 'galleryImages',
      type: 'array',
      group: 'gallery',
      title: 'Images du ticker (5 a 8 ideal, ratios libres)',
      of: [{
        type: 'object',
        name: 'tickerItem',
        fields: [
          defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
          defineField({ name: 'aspectRatio', type: 'string',
            title: 'Ratio (ex. "0.75", "1.5", "0.667")',
            description: 'Largeur/hauteur. Vide = ratio natif.',
          }),
        ],
        preview: { select: { media: 'image', subtitle: 'aspectRatio' } },
      }],
    }),

    // --- CTA bottom ---
    defineField({ name: 'ctaImage', type: 'image', group: 'cta',
      title: 'Image fond CTA (full-bleed)', options: { hotspot: true } }),
    defineField({ name: 'ctaBodyOverride', type: 'localizedText', group: 'cta',
      title: 'Corps CTA override (laisser vide pour i18n)' }),

    // --- SECTIONS LIBRES ---
    defineField({ name: 'sections', type: 'array', group: 'sections',
      title: 'Sections additionnelles',
      description: 'Inserees entre la galerie et le CTA final.',
      of: SECTION_BLOCKS,
    }),

    // --- SEO ---
    defineField({ name: 'seo', type: 'seoMeta', group: 'seo' }),
  ],
  preview: {
    prepare() { return { title: 'Page About' }; },
  },
});

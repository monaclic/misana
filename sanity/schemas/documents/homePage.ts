// Singleton de la page d'accueil. Contient :
// - Hero intro panel (image + H1 + lead + sub)
// - 5 service panels (1 image + override copy optionnel)
// - Section agenda (kicker + titre + lead + footnote)
// - Section testimonials (kicker + titre + accent)
// - Sections additionnelles polymorphes (libre)
// - SEO
//
// Tous les overrides copy sont optionnels : si vides, la page utilise les
// traductions i18n existantes (FR/EN). Permet a l'associee de modifier
// sans casser le site.
import { defineType, defineField } from 'sanity';
import { SECTION_BLOCKS } from '../objects/blocks';

const SERVICE_KEYS = [
  { title: 'Chauffeur', value: 'chauffeur' },
  { title: 'Cars', value: 'cars' },
  { title: 'Yacht', value: 'yacht' },
  { title: 'Helicopter', value: 'helicopter' },
  { title: 'Access', value: 'access' },
] as const;

export const homePage = defineType({
  name: 'homePage',
  title: 'Page d\'accueil',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero (intro)' },
    { name: 'services', title: 'Panels services' },
    { name: 'agenda', title: 'Section agenda' },
    { name: 'testimonials', title: 'Section temoignages' },
    { name: 'sections', title: 'Sections libres' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // --- HERO ---
    defineField({ name: 'heroImage', type: 'image', group: 'hero',
      title: 'Image hero (1er panel)', options: { hotspot: true } }),
    defineField({ name: 'heroTitleOverride', type: 'localizedString', group: 'hero',
      title: 'Titre H1 override (laisser vide pour traduction i18n)' }),
    defineField({ name: 'heroBodyOverride', type: 'localizedText', group: 'hero',
      title: 'Lead override (laisser vide pour traduction i18n)' }),
    defineField({ name: 'heroSubOverride', type: 'localizedString', group: 'hero',
      title: 'Petite ligne sous le form override (laisser vide pour i18n)' }),

    // --- SERVICE PANELS ---
    defineField({
      name: 'servicePanels',
      type: 'array',
      group: 'services',
      title: 'Panels services (sticky stack)',
      description: '5 panels reveal scroll. Image + slug. Copy via i18n par defaut, override possible.',
      of: [{
        type: 'object',
        name: 'servicePanel',
        fields: [
          defineField({ name: 'service', type: 'string',
            title: 'Service', options: { list: SERVICE_KEYS as any } }),
          defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
          defineField({ name: 'titleOverride', type: 'localizedString',
            title: 'Titre override (sinon traduction i18n)' }),
          defineField({ name: 'bodyOverride', type: 'localizedText',
            title: 'Body override (sinon traduction i18n)' }),
          defineField({ name: 'ctaLabelOverride', type: 'localizedString',
            title: 'CTA override (sinon traduction i18n)' }),
        ],
        preview: { select: { title: 'service', media: 'image' } },
      }],
      validation: (r) => r.length(5).warning('Conseille : 5 panels (un par service)'),
    }),

    // --- AGENDA ---
    defineField({ name: 'agendaKickerOverride', type: 'localizedString', group: 'agenda',
      title: 'Kicker override (ex. "(MS · 02) · The season")' }),
    defineField({ name: 'agendaTitleOverride', type: 'localizedString', group: 'agenda',
      title: 'Titre override' }),
    defineField({ name: 'agendaLeadOverride', type: 'localizedText', group: 'agenda',
      title: 'Lead override' }),
    defineField({ name: 'agendaFootnoteOverride', type: 'localizedString', group: 'agenda',
      title: 'Footnote override' }),

    // --- TESTIMONIALS ---
    defineField({ name: 'testimonialsKickerOverride', type: 'localizedString', group: 'testimonials',
      title: 'Kicker override' }),
    defineField({ name: 'testimonialsTitleStartOverride', type: 'localizedString', group: 'testimonials',
      title: 'Debut titre override' }),
    defineField({ name: 'testimonialsTitleAccentOverride', type: 'localizedString', group: 'testimonials',
      title: 'Accent italique titre override' }),

    // --- LIBRE ---
    defineField({ name: 'sections', type: 'array', group: 'sections',
      title: 'Sections additionnelles (ordre libre)',
      description: 'Blocs editoriaux ajoutables/reorderables sans toucher au code.',
      of: SECTION_BLOCKS,
    }),

    // --- SEO ---
    defineField({ name: 'seo', type: 'seoMeta', group: 'seo' }),
  ],
  preview: {
    prepare() { return { title: 'Page d\'accueil' }; },
  },
});

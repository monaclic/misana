// Hub d'un service (chauffeur, cars, yacht, helicopter, access).
// 5 docs en base, un par service. La copy editoriale specifique de
// chaque sous-section reste en i18n V1 (ex. chauffeur.transfersTitle) :
// on expose ici uniquement les overrides du HERO + SEO + sections libres.
//
// Permet a l'associee de :
// - Changer l'image hero de chaque hub
// - Override le titre H1 et le lead du hero
// - Editer le SEO (title/description/og)
// - Ajouter des sections editoriales libres (blocs polymorphes)
import { defineType, defineField } from 'sanity';
import { SECTION_BLOCKS } from '../objects/blocks';

const SERVICES = [
  { title: 'Chauffeur', value: 'chauffeur' },
  { title: 'Cars',      value: 'cars' },
  { title: 'Yacht',     value: 'yacht' },
  { title: 'Helicopter', value: 'helicopter' },
  { title: 'Access',    value: 'access' },
] as const;

export const serviceHub = defineType({
  name: 'serviceHub',
  title: 'Service hub',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identite' },
    { name: 'hero', title: 'Hero' },
    { name: 'sections', title: 'Sections libres' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'service', type: 'string', group: 'identity',
      title: 'Service',
      options: { list: SERVICES as any },
      validation: (r) => r.required(),
    }),

    // --- HERO ---
    defineField({ name: 'heroImage', type: 'image', group: 'hero',
      title: 'Image hero', options: { hotspot: true } }),
    defineField({ name: 'heroTitleOverride', type: 'localizedString', group: 'hero',
      title: 'Titre H1 override (sinon traduction i18n)' }),
    defineField({ name: 'heroLeadOverride', type: 'localizedText', group: 'hero',
      title: 'Lead override (sinon traduction i18n)' }),

    // --- SECTIONS LIBRES ---
    defineField({ name: 'sections', type: 'array', group: 'sections',
      title: 'Sections additionnelles (ordre libre)',
      description: 'Blocs editoriaux. Apparaitront sur le hub apres les sections fixes.',
      of: SECTION_BLOCKS,
    }),

    // --- SEO ---
    defineField({ name: 'seo', type: 'seoMeta', group: 'seo' }),
  ],
  preview: {
    select: { service: 'service', media: 'heroImage' },
    prepare({ service, media }) {
      return { title: `Hub : ${service || '(no service)'}`, media };
    },
  },
});

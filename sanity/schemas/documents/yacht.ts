import { defineType, defineField } from 'sanity';

export const yacht = defineType({
  name: 'yacht',
  title: 'Yacht (charter)',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identite', default: true },
    { name: 'specs', title: 'Specs' },
    { name: 'media', title: 'Media' },
    { name: 'pricing', title: 'Tarifs' },
    { name: 'availability', title: 'Disponibilite' },
    { name: 'amenities', title: 'Equipements' },
    { name: 'copy', title: 'Description' },
  ],
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug (legacy, à supprimer après refonte)',
      options: { source: 'fullName' },
      group: 'identity',
    }),
    // slugI18n : nouveau champ slug localisé { fr, en } cohabite avec
    // l'ancien champ `slug` pendant la transition (Phase 1 -> Phase 4).
    defineField({
      name: 'slugI18n',
      type: 'localizedSlug',
      title: 'Slug i18n (URL FR / EN)',
      group: 'identity',
    }),
    defineField({ name: 'name', type: 'string', title: 'Nom du yacht', group: 'identity', validation: (r) => r.required() }),
    defineField({ name: 'builder', type: 'string', title: 'Constructeur', group: 'identity' }),
    defineField({ name: 'model', type: 'string', title: 'Modele', group: 'identity' }),
    defineField({ name: 'fullName', type: 'string', title: 'Nom complet', group: 'identity', validation: (r) => r.required() }),
    defineField({
      name: 'type',
      type: 'string',
      title: 'Type',
      group: 'identity',
      options: {
        list: [
          { title: 'Moteur', value: 'motor' },
          { title: 'Voile', value: 'sail' },
          { title: 'Catamaran', value: 'catamaran' },
        ],
      },
    }),
    defineField({
      name: 'size',
      type: 'string',
      title: 'Taille',
      group: 'identity',
      options: {
        list: [
          { title: '< 20 m', value: 'small' },
          { title: '20-30 m', value: 'medium' },
          { title: '30-50 m', value: 'large' },
          { title: '50 m +', value: 'mega' },
        ],
      },
    }),
    defineField({
      name: 'badge',
      type: 'string',
      title: 'Badge',
      group: 'identity',
      options: {
        list: [
          { title: 'Aucun', value: '' },
          { title: 'Populaire', value: 'popular' },
          { title: 'Vedette (flagship)', value: 'flagship' },
        ],
      },
    }),
    defineField({ name: 'order', type: 'number', title: 'Ordre d\'affichage', group: 'identity', initialValue: 0 }),
    defineField({ name: 'published', type: 'boolean', title: 'Publie', group: 'identity', initialValue: true }),

    // Specs
    defineField({ name: 'lengthM', type: 'number', title: 'Longueur (m)', group: 'specs' }),
    defineField({ name: 'cabins', type: 'number', title: 'Nombre de cabines', group: 'specs' }),
    defineField({
      name: 'cabinDetail',
      type: 'object',
      title: 'Detail cabines',
      group: 'specs',
      fields: [
        defineField({ name: 'master', type: 'number', title: 'Master' }),
        defineField({ name: 'vip', type: 'number', title: 'VIP' }),
        defineField({ name: 'double', type: 'number', title: 'Double' }),
        defineField({ name: 'twin', type: 'number', title: 'Twin' }),
        defineField({ name: 'pullman', type: 'number', title: 'Pullman' }),
      ],
    }),
    defineField({ name: 'guests', type: 'number', title: 'Capacite invites', group: 'specs' }),
    defineField({ name: 'crew', type: 'number', title: 'Equipage', group: 'specs' }),
    defineField({ name: 'cruisingKnots', type: 'number', title: 'Vitesse de croisiere (kn)', group: 'specs' }),
    defineField({ name: 'maxKnots', type: 'number', title: 'Vitesse max (kn)', group: 'specs' }),
    defineField({ name: 'year', type: 'number', title: 'Annee', group: 'specs' }),

    // Media
    defineField({ name: 'hero', type: 'image', title: 'Image principale', group: 'media', options: { hotspot: true } }),
    defineField({
      name: 'gallery',
      type: 'array',
      title: 'Galerie',
      group: 'media',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),

    // Pricing
    defineField({ name: 'pricePerDay', type: 'number', title: 'Prix par jour (EUR)', group: 'pricing' }),
    defineField({ name: 'pricePerWeekFrom', type: 'number', title: 'Prix semaine min (EUR)', group: 'pricing' }),
    defineField({ name: 'pricePerWeekTo', type: 'number', title: 'Prix semaine max (EUR, optionnel)', group: 'pricing' }),

    // Availability
    defineField({
      name: 'ports',
      type: 'array',
      title: 'Ports d\'attache / disponibilite',
      group: 'availability',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'cruisingAreas',
      type: 'array',
      title: 'Zones de navigation',
      group: 'availability',
      of: [{ type: 'string' }],
    }),

    // Amenities
    defineField({
      name: 'amenities',
      type: 'array',
      title: 'Equipements',
      group: 'amenities',
      of: [{ type: 'string' }],
    }),

    // Copy
    defineField({ name: 'shortDesc', type: 'localizedString', title: 'Description courte', group: 'copy' }),
    defineField({ name: 'body', type: 'localizedText', title: 'Description longue', group: 'copy' }),
  ],
  preview: { select: { title: 'fullName', media: 'hero', subtitle: 'type' } },
  orderings: [
    { title: 'Ordre manuel', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Nom (A-Z)', name: 'name', by: [{ field: 'name', direction: 'asc' }] },
  ],
});

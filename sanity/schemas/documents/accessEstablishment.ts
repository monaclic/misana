import { defineType, defineField } from 'sanity';

export const accessEstablishment = defineType({
  name: 'accessEstablishment',
  title: 'Etablissement (Access)',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identite', default: true },
    { name: 'media', title: 'Media' },
    { name: 'about', title: 'Description' },
    { name: 'practical', title: 'Pratique' },
    { name: 'reservation', title: 'Reservation' },
    { name: 'editorial', title: 'Notes & FAQ' },
  ],
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug (legacy, à supprimer après refonte)',
      options: { source: 'name' },
      group: 'identity',
    }),
    defineField({
      name: 'slugI18n',
      type: 'localizedSlug',
      title: 'Slug i18n (URL FR / EN)',
      group: 'identity',
    }),
    defineField({ name: 'name', type: 'string', title: 'Nom', group: 'identity', validation: (r) => r.required() }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Categorie',
      group: 'identity',
      options: {
        list: [
          { title: 'Restaurant', value: 'restaurant' },
          { title: 'Palace', value: 'palace' },
          { title: 'Beach club', value: 'beach-club' },
          { title: 'Nightclub', value: 'nightclub' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'city',
      type: 'string',
      title: 'Ville',
      group: 'identity',
      options: {
        list: [
          { title: 'Saint-Tropez', value: 'saint-tropez' },
          { title: 'Cannes', value: 'cannes' },
          { title: 'Cap-d\'Antibes', value: 'cap-d-antibes' },
          { title: 'Cap-Ferrat', value: 'cap-ferrat' },
          { title: 'Nice', value: 'nice' },
          { title: 'Eze', value: 'eze' },
          { title: 'Monaco', value: 'monaco' },
          { title: 'Menton', value: 'menton' },
        ],
      },
    }),
    defineField({ name: 'housePick', type: 'boolean', title: 'House pick (Coup de coeur)', group: 'identity', initialValue: false }),
    defineField({ name: 'order', type: 'number', title: 'Ordre d\'affichage', group: 'identity', initialValue: 0 }),
    defineField({ name: 'published', type: 'boolean', title: 'Publie', group: 'identity', initialValue: true }),

    // Media
    defineField({ name: 'hero', type: 'image', title: 'Image principale', group: 'media', options: { hotspot: true } }),
    defineField({
      name: 'thumbs',
      type: 'array',
      title: 'Galerie',
      group: 'media',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),

    // About
    defineField({ name: 'signature', type: 'localizedString', title: 'Signature (phrase d\'accroche)', group: 'about' }),
    defineField({ name: 'about', type: 'localizedText', title: 'A propos', group: 'about' }),
    defineField({
      name: 'factualLabelsFr',
      type: 'array',
      title: 'Etiquettes factuelles (FR)',
      group: 'about',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'factualLabelsEn',
      type: 'array',
      title: 'Factual labels (EN)',
      group: 'about',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'bestForFr',
      type: 'array',
      title: 'Idéal pour (FR)',
      group: 'about',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'bestForEn',
      type: 'array',
      title: 'Best for (EN)',
      group: 'about',
      of: [{ type: 'string' }],
    }),

    // Practical
    defineField({ name: 'address', type: 'localizedString', title: 'Adresse', group: 'practical' }),
    defineField({ name: 'cuisine', type: 'localizedString', title: 'Cuisine', group: 'practical' }),
    defineField({ name: 'chef', type: 'string', title: 'Chef', group: 'practical' }),
    defineField({ name: 'hours', type: 'localizedString', title: 'Horaires', group: 'practical' }),
    defineField({ name: 'dressCode', type: 'localizedString', title: 'Dress code', group: 'practical' }),
    defineField({ name: 'year', type: 'number', title: 'Annee de fondation', group: 'practical' }),

    // Reservation
    defineField({
      name: 'reservation',
      type: 'object',
      title: 'Reservation',
      group: 'reservation',
      fields: [
        defineField({ name: 'enabled', type: 'boolean', title: 'Reservation possible', initialValue: true }),
        defineField({ name: 'minGuests', type: 'number', title: 'Min invites', initialValue: 1 }),
        defineField({ name: 'maxGuests', type: 'number', title: 'Max invites', initialValue: 12 }),
        defineField({ name: 'leadTimeHours', type: 'number', title: 'Delai prevenance (heures)', initialValue: 48 }),
        defineField({
          name: 'serviceOptions',
          type: 'array',
          title: 'Options service',
          of: [{ type: 'string' }],
          options: {
            list: [
              { title: 'Dejeuner', value: 'lunch' },
              { title: 'Diner', value: 'dinner' },
              { title: 'Soiree', value: 'evening' },
              { title: 'Sejour', value: 'stay' },
            ],
          },
        }),
      ],
    }),

    // Editorial
    defineField({ name: 'teamNotes', type: 'localizedText', title: 'Notes equipe Misana', group: 'editorial' }),
    defineField({
      name: 'faq',
      type: 'array',
      title: 'FAQ',
      group: 'editorial',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'question', type: 'localizedString', title: 'Question' }),
          defineField({ name: 'answer', type: 'localizedText', title: 'Reponse' }),
        ],
        preview: { select: { title: 'question.fr' } },
      }],
    }),
  ],
  preview: { select: { title: 'name', media: 'hero', subtitle: 'category' } },
  orderings: [
    { title: 'Ordre manuel', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Nom (A-Z)', name: 'name', by: [{ field: 'name', direction: 'asc' }] },
  ],
});

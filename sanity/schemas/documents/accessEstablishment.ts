import { defineType, defineField } from 'sanity';

// Mapping legacy → nouveau (apres migration des fiches existantes) :
//   signature          → shortLine
//   factualLabelsFr/En → signatureTags.fr/en
//   bestForFr/En       → occasions.fr/en
//   about              → aboutText
//   hours              → horaires
//   dressCode          → tenue
//   thumbs             → imageGallery (limite a 4 photos)
// Les champs legacy sont conserves (donnees Le Louis XV) mais marques
// "[legacy, ne plus remplir]" pour eviter qu'un editeur les utilise. Apres
// migration data + cleanup front, on pourra les supprimer.

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
    { name: 'meta', title: 'Metadonnees' },
    { name: 'legacy', title: 'Legacy (deprecie)' },
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
          { title: 'Ramatuelle', value: 'ramatuelle' },
          { title: 'Antibes', value: 'antibes' },
          { title: 'Cap d\'Antibes', value: 'cap-d-antibes' },
          { title: 'Cannes', value: 'cannes' },
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

    // === Media ===
    defineField({ name: 'hero', type: 'image', title: 'Image principale', group: 'media', options: { hotspot: true } }),
    defineField({
      name: 'imageGallery',
      type: 'array',
      title: 'Galerie (max 4 photos)',
      group: 'media',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.max(4).warning('La galerie est limitee a 4 photos.'),
    }),

    // === About (nouveaux noms standardises) ===
    defineField({
      name: 'shortLine',
      type: 'localizedString',
      title: 'Phrase d\'accroche (une ligne)',
      group: 'about',
    }),
    defineField({
      name: 'aboutText',
      type: 'localizedText',
      title: 'A propos (texte multi-ligne)',
      group: 'about',
    }),
    defineField({
      name: 'longDescription',
      type: 'localizedText',
      title: 'Description longue (Excellence)',
      group: 'about',
      description: 'Texte importe depuis Excellence Riviera. Modifiable manuellement.',
    }),
    defineField({
      name: 'signatureTags',
      type: 'localizedStringArray',
      title: 'Etiquettes signature (factuelles)',
      group: 'about',
    }),
    defineField({
      name: 'occasions',
      type: 'localizedStringArray',
      title: 'Occasions (ideal pour...)',
      group: 'about',
    }),

    // === Practical ===
    defineField({
      name: 'address',
      type: 'text',
      title: 'Adresse (multi-ligne)',
      group: 'practical',
      rows: 4,
      description: 'Adresse complete avec retours a la ligne. Utilise depuis Excellence.',
    }),
    defineField({
      name: 'establishmentType',
      type: 'string',
      title: 'Type d\'etablissement',
      group: 'practical',
      description: 'Ex : "Restaurant", "Plage Privee", "Restaurant, Plage Privee".',
    }),
    defineField({
      name: 'ambiance',
      type: 'array',
      title: 'Ambiance',
      group: 'practical',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'cuisineType',
      type: 'array',
      title: 'Type de cuisine',
      group: 'practical',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'horaires',
      type: 'localizedString',
      title: 'Horaires',
      group: 'practical',
    }),
    defineField({
      name: 'tenue',
      type: 'localizedString',
      title: 'Tenue (dress code)',
      group: 'practical',
    }),
    defineField({
      name: 'seasonality',
      type: 'string',
      title: 'Saisonnalite',
      group: 'practical',
      options: {
        list: [
          { title: 'Annuel', value: 'annuel' },
          { title: 'Ete uniquement', value: 'ete-uniquement' },
        ],
      },
      initialValue: 'annuel',
    }),
    defineField({ name: 'chef', type: 'string', title: 'Chef', group: 'practical' }),
    defineField({ name: 'year', type: 'number', title: 'Annee de fondation', group: 'practical' }),

    // === Legacy (anciens champs, ne plus remplir) ===
    defineField({
      name: 'signature',
      type: 'localizedString',
      title: '[legacy] Signature — utiliser shortLine',
      group: 'legacy',
      readOnly: true,
    }),
    defineField({
      name: 'about',
      type: 'localizedText',
      title: '[legacy] About — utiliser aboutText',
      group: 'legacy',
      readOnly: true,
    }),
    defineField({
      name: 'factualLabelsFr',
      type: 'array',
      title: '[legacy] Factual labels FR — utiliser signatureTags.fr',
      group: 'legacy',
      of: [{ type: 'string' }],
      readOnly: true,
    }),
    defineField({
      name: 'factualLabelsEn',
      type: 'array',
      title: '[legacy] Factual labels EN — utiliser signatureTags.en',
      group: 'legacy',
      of: [{ type: 'string' }],
      readOnly: true,
    }),
    defineField({
      name: 'bestForFr',
      type: 'array',
      title: '[legacy] Best for FR — utiliser occasions.fr',
      group: 'legacy',
      of: [{ type: 'string' }],
      readOnly: true,
    }),
    defineField({
      name: 'bestForEn',
      type: 'array',
      title: '[legacy] Best for EN — utiliser occasions.en',
      group: 'legacy',
      of: [{ type: 'string' }],
      readOnly: true,
    }),
    defineField({
      name: 'cuisine',
      type: 'localizedString',
      title: '[legacy] Cuisine — utiliser cuisineType',
      group: 'legacy',
      readOnly: true,
    }),
    defineField({
      name: 'hours',
      type: 'localizedString',
      title: '[legacy] Hours — utiliser horaires',
      group: 'legacy',
      readOnly: true,
    }),
    defineField({
      name: 'dressCode',
      type: 'localizedString',
      title: '[legacy] Dress code — utiliser tenue',
      group: 'legacy',
      readOnly: true,
    }),
    defineField({
      name: 'thumbs',
      type: 'array',
      title: '[legacy] Thumbs — utiliser imageGallery',
      group: 'legacy',
      of: [{ type: 'image', options: { hotspot: true } }],
      readOnly: true,
    }),

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

    // === Metadonnees ===
    defineField({
      name: 'excellenceSourceUrl',
      type: 'url',
      title: 'URL source Excellence',
      group: 'meta',
      description: 'URL de la fiche Excellence Riviera ayant servi a importer le contenu informationnel.',
      readOnly: true,
    }),
    defineField({
      name: 'scrapedAt',
      type: 'datetime',
      title: 'Date du dernier import',
      group: 'meta',
      readOnly: true,
    }),
  ],
  preview: { select: { title: 'name', media: 'hero', subtitle: 'category' } },
  orderings: [
    { title: 'Ordre manuel', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Nom (A-Z)', name: 'name', by: [{ field: 'name', direction: 'asc' }] },
  ],
});

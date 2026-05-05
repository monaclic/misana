import { defineType, defineField } from 'sanity';

export const rentalCar = defineType({
  name: 'rentalCar',
  title: 'Voiture de location',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identite', default: true },
    { name: 'specs', title: 'Specs' },
    { name: 'media', title: 'Media' },
    { name: 'pricing', title: 'Tarifs & conditions' },
    { name: 'availability', title: 'Disponibilite' },
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
    defineField({
      name: 'slugI18n',
      type: 'localizedSlug',
      title: 'Slug i18n (URL FR / EN)',
      group: 'identity',
    }),
    defineField({ name: 'brand', type: 'string', title: 'Marque', group: 'identity', validation: (r) => r.required() }),
    defineField({ name: 'model', type: 'string', title: 'Modele', group: 'identity', validation: (r) => r.required() }),
    defineField({ name: 'fullName', type: 'string', title: 'Nom complet', group: 'identity', validation: (r) => r.required() }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'rentalCarCategory' }],
      group: 'identity',
      validation: (r) => r.required(),
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
    defineField({ name: 'pax', type: 'number', title: 'Passagers', group: 'specs' }),
    defineField({ name: 'hp', type: 'number', title: 'Puissance (ch)', group: 'specs' }),
    defineField({ name: 'topSpeedKmh', type: 'number', title: 'Vitesse max (km/h)', group: 'specs' }),
    defineField({
      name: 'transmission',
      type: 'string',
      title: 'Transmission',
      group: 'specs',
      options: { list: [{ title: 'Automatique', value: 'auto' }, { title: 'Manuelle', value: 'manual' }] },
    }),
    defineField({
      name: 'fuelType',
      type: 'string',
      title: 'Carburant',
      group: 'specs',
      options: {
        list: [
          { title: 'Essence', value: 'gasoline' },
          { title: 'Hybride', value: 'hybrid' },
          { title: 'Electrique', value: 'electric' },
          { title: 'Diesel', value: 'diesel' },
        ],
      },
    }),
    defineField({ name: 'year', type: 'number', title: 'Annee', group: 'specs' }),

    // Media
    defineField({
      name: 'hero',
      type: 'image',
      title: 'Image principale',
      group: 'media',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      title: 'Galerie',
      group: 'media',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),

    // Pricing
    defineField({
      name: 'prices',
      type: 'object',
      title: 'Prix par jour selon duree',
      group: 'pricing',
      fields: [
        defineField({ name: 'oneToThreeDays', type: 'number', title: '1 a 3 jours' }),
        defineField({ name: 'fourToSevenDays', type: 'number', title: '4 a 7 jours' }),
        defineField({ name: 'weekPlus', type: 'number', title: 'Semaine +' }),
      ],
    }),
    defineField({
      name: 'conditions',
      type: 'object',
      title: 'Conditions de location',
      group: 'pricing',
      fields: [
        defineField({ name: 'minAge', type: 'number', title: 'Age minimum' }),
        defineField({ name: 'securityDeposit', type: 'number', title: 'Caution (EUR)' }),
        defineField({ name: 'minDays', type: 'number', title: 'Duree min (jours)' }),
        defineField({ name: 'includedKmPerDay', type: 'number', title: 'Km inclus / jour' }),
        defineField({ name: 'overageRatePerKm', type: 'number', title: 'Tarif km supplementaire (EUR)' }),
      ],
    }),

    // Availability
    defineField({
      name: 'availableCities',
      type: 'array',
      title: 'Villes disponibles',
      group: 'availability',
      of: [{ type: 'string' }],
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

    // Copy
    defineField({
      name: 'shortDesc',
      type: 'localizedString',
      title: 'Description courte',
      group: 'copy',
    }),
    defineField({
      name: 'body',
      type: 'localizedText',
      title: 'Description longue',
      group: 'copy',
    }),
  ],
  preview: {
    select: { title: 'fullName', media: 'hero', subtitle: 'category.name.fr' },
  },
  orderings: [
    { title: 'Ordre manuel', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Marque (A-Z)', name: 'brand', by: [{ field: 'brand', direction: 'asc' }] },
  ],
});

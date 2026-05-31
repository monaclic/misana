import { defineType, defineField } from 'sanity';

// Schema villa : fiche d'une villa de location issue du catalogue
// Le Collectionist (mapping vers attributes + relationships v3).
// Source de verite distante : api.lecollectionist.com (lcHouseId).
// Champs trace import en group meta (readOnly).
//
// NB : ce schema n'est PAS enregistre dans sanity/schemas/index.ts a
// dessein. La decision business "villas en V1" n'est pas prise (cf
// CLAUDE.md projet section 11 : "pas villas"). L'ajout dans l'index
// declencherait l'apparition du type dans le studio production des
// le prochain deploy.

export const villa = defineType({
  name: 'villa',
  title: 'Villa (location)',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identite', default: true },
    { name: 'specs', title: 'Specs' },
    { name: 'media', title: 'Media' },
    { name: 'rooms', title: 'Chambres' },
    { name: 'pools', title: 'Piscines' },
    { name: 'amenities', title: 'Equipements' },
    { name: 'pricing', title: 'Tarifs' },
    { name: 'surroundings', title: 'Environnement' },
    { name: 'services', title: 'Services' },
    { name: 'policies', title: 'Politiques' },
    { name: 'copy', title: 'Description' },
    { name: 'seo', title: 'SEO' },
    { name: 'meta', title: 'Metadonnees (admin)' },
  ],
  fields: [
    // === Identity ===
    defineField({
      name: 'slugI18n',
      type: 'localizedSlug',
      title: 'Slug i18n (URL FR / EN)',
      group: 'identity',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'name',
      type: 'string',
      title: 'Nom de la villa',
      group: 'identity',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'city',
      type: 'string',
      title: 'Ville',
      group: 'identity',
      validation: (r) => r.required(),
      options: {
        list: [
          { title: 'Saint-Tropez', value: 'saint-tropez' },
          { title: 'Ramatuelle', value: 'ramatuelle' },
          { title: 'Gassin', value: 'gassin' },
          { title: 'Grimaud', value: 'grimaud' },
          { title: 'La Croix-Valmer', value: 'la-croix-valmer' },
          { title: 'Sainte-Maxime', value: 'sainte-maxime' },
          { title: 'Cavalaire-sur-Mer', value: 'cavalaire-sur-mer' },
          { title: 'Cannes', value: 'cannes' },
          { title: 'Mougins', value: 'mougins' },
          { title: 'Antibes', value: 'antibes' },
          { title: 'Cap d\'Antibes', value: 'cap-d-antibes' },
          { title: 'Villefranche-sur-Mer', value: 'villefranche-sur-mer' },
          { title: 'Nice', value: 'nice' },
          { title: 'Eze', value: 'eze' },
          { title: 'Monaco', value: 'monaco' },
          { title: 'Menton', value: 'menton' },
          { title: 'Cap-Ferrat', value: 'cap-ferrat' },
        ],
      },
    }),
    defineField({
      name: 'published',
      type: 'boolean',
      title: 'Publie',
      group: 'identity',
      initialValue: true,
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Mise en avant',
      group: 'identity',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Ordre d\'affichage',
      group: 'identity',
      initialValue: 0,
    }),
    defineField({
      name: 'gpsLat',
      type: 'number',
      title: 'Latitude GPS',
      group: 'identity',
      description: 'Decimal degrees, ex 43.704. Importe depuis attributes.gpslatitude.',
    }),
    defineField({
      name: 'gpsLng',
      type: 'number',
      title: 'Longitude GPS',
      group: 'identity',
      description: 'Decimal degrees, ex 7.281. Importe depuis attributes.gpslongitude.',
    }),

    // === Specs ===
    defineField({ name: 'capacity', type: 'number', title: 'Capacite (personnes)', group: 'specs' }),
    defineField({ name: 'capacityAdults', type: 'number', title: 'Capacite adultes', group: 'specs' }),
    defineField({ name: 'bedrooms', type: 'number', title: 'Chambres', group: 'specs' }),
    defineField({ name: 'bathrooms', type: 'number', title: 'Salles de bain', group: 'specs' }),
    defineField({ name: 'surface', type: 'number', title: 'Surface habitable (m2)', group: 'specs' }),
    defineField({ name: 'domainSurface', type: 'number', title: 'Surface terrain (m2)', group: 'specs' }),
    defineField({ name: 'elevator', type: 'boolean', title: 'Ascenseur', group: 'specs', initialValue: false }),
    defineField({ name: 'insideParking', type: 'boolean', title: 'Parking interieur', group: 'specs', initialValue: false }),
    defineField({ name: 'insideParkingPlaces', type: 'number', title: 'Places parking interieur', group: 'specs' }),
    defineField({ name: 'outsideParking', type: 'boolean', title: 'Parking exterieur', group: 'specs', initialValue: false }),
    defineField({ name: 'outsideParkingPlaces', type: 'number', title: 'Places parking exterieur', group: 'specs' }),
    defineField({ name: 'floorHeatingSystem', type: 'boolean', title: 'Chauffage au sol', group: 'specs', initialValue: false }),
    defineField({ name: 'petFriendly', type: 'boolean', title: 'Animaux acceptes', group: 'specs', initialValue: false }),
    defineField({ name: 'suitableForChildren', type: 'boolean', title: 'Adapte aux enfants', group: 'specs', initialValue: true }),
    defineField({ name: 'suitableForPeopleWithReducedMobility', type: 'boolean', title: 'Accessibilite PMR', group: 'specs', initialValue: false }),
    defineField({ name: 'matterportUrl', type: 'url', title: 'URL visite virtuelle 360', group: 'specs' }),

    // === Media ===
    defineField({
      name: 'hero',
      type: 'image',
      title: 'Image principale',
      group: 'media',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      title: 'Galerie',
      group: 'media',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),

    // === Rooms ===
    defineField({
      name: 'rooms',
      type: 'array',
      title: 'Detail chambres',
      group: 'rooms',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', type: 'localizedString', title: 'Nom de la chambre' }),
          defineField({ name: 'bedType', type: 'localizedString', title: 'Type de lit' }),
          defineField({ name: 'terrace', type: 'boolean', title: 'Terrasse', initialValue: false }),
          defineField({ name: 'tv', type: 'boolean', title: 'Television', initialValue: false }),
          defineField({ name: 'ac', type: 'boolean', title: 'Climatisation', initialValue: false }),
          defineField({ name: 'safe', type: 'boolean', title: 'Coffre-fort', initialValue: false }),
          defineField({ name: 'seaView', type: 'boolean', title: 'Vue mer', initialValue: false }),
          defineField({ name: 'ensuiteBathroom', type: 'boolean', title: 'Salle de bain attenante', initialValue: false }),
        ],
        preview: { select: { title: 'name.fr', subtitle: 'bedType.fr' } },
      }],
    }),

    // === Pools ===
    defineField({
      name: 'pools',
      type: 'array',
      title: 'Piscines',
      group: 'pools',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', type: 'localizedString', title: 'Nom' }),
          defineField({ name: 'heated', type: 'boolean', title: 'Chauffee', initialValue: false }),
          defineField({ name: 'indoor', type: 'boolean', title: 'Interieure', initialValue: false }),
          defineField({ name: 'lengthM', type: 'number', title: 'Longueur (m)' }),
          defineField({ name: 'widthM', type: 'number', title: 'Largeur (m)' }),
          defineField({ name: 'sunbeds', type: 'number', title: 'Nombre de transats' }),
        ],
        preview: { select: { title: 'name.fr' } },
      }],
    }),

    // === Amenities ===
    defineField({
      name: 'keyFeatures',
      type: 'localizedStringArray',
      title: 'Equipements phares (affichage hero)',
      group: 'amenities',
      description: 'Les 4 a 6 incontournables affiches en avant sur la fiche (ex : piscine chauffee, vue mer, climatisation, BBQ, chauffage au sol).',
    }),
    defineField({
      name: 'amenities',
      type: 'localizedStringArray',
      title: 'Equipements complets',
      group: 'amenities',
    }),

    // === Pricing ===
    defineField({
      name: 'pricePerWeekFrom',
      type: 'number',
      title: 'Prix semaine minimum (EUR)',
      group: 'pricing',
    }),
    defineField({
      name: 'pricePerWeekTo',
      type: 'number',
      title: 'Prix semaine maximum (EUR)',
      group: 'pricing',
    }),

    // === Surroundings ===
    defineField({
      name: 'setting',
      type: 'string',
      title: 'Cadre',
      group: 'surroundings',
      options: {
        list: [
          { title: 'Hors de la ville', value: 'out-of-town' },
          { title: 'Face mer', value: 'beachfront' },
          { title: 'En ville', value: 'in-city' },
          { title: 'Campagne', value: 'countryside' },
        ],
      },
    }),
    defineField({ name: 'seaView', type: 'boolean', title: 'Vue mer', group: 'surroundings', initialValue: false }),
    defineField({ name: 'beachDistanceMin', type: 'number', title: 'Distance plage (minutes en voiture)', group: 'surroundings' }),
    defineField({ name: 'downtownDistanceMin', type: 'number', title: 'Distance centre-ville (min)', group: 'surroundings' }),
    defineField({ name: 'restaurantsDistanceMin', type: 'number', title: 'Distance restaurants (min)', group: 'surroundings' }),
    defineField({ name: 'shopsDistanceMin', type: 'number', title: 'Distance commerces (min)', group: 'surroundings' }),
    defineField({ name: 'surroundingDescription', type: 'localizedText', title: 'Description environnement', group: 'surroundings' }),

    // === Services ===
    defineField({ name: 'includedServices', type: 'localizedStringArray', title: 'Services inclus', group: 'services' }),
    defineField({ name: 'aLaCarteServices', type: 'localizedStringArray', title: 'Services a la carte', group: 'services' }),
    defineField({ name: 'housekeepingFrequency', type: 'localizedString', title: 'Frequence du menage', group: 'services' }),

    // === Policies ===
    defineField({
      name: 'checkInTime',
      type: 'number',
      title: 'Heure check-in (0-23, ex : 17)',
      group: 'policies',
      validation: (r) => r.min(0).max(23).integer(),
    }),
    defineField({
      name: 'checkOutTime',
      type: 'number',
      title: 'Heure check-out (0-23, ex : 10)',
      group: 'policies',
      validation: (r) => r.min(0).max(23).integer(),
    }),
    defineField({ name: 'licenceNumber', type: 'string', title: 'Numero de licence (meuble de tourisme)', group: 'policies' }),
    defineField({ name: 'publicTaxes', type: 'number', title: 'Taxe de sejour (EUR)', group: 'policies' }),
    defineField({ name: 'displayPrices', type: 'boolean', title: 'Afficher les prix publiquement', group: 'policies', initialValue: true }),
    defineField({ name: 'flexibleCancellation', type: 'boolean', title: 'Annulation flexible', group: 'policies', initialValue: false }),
    defineField({ name: 'onlineReservation', type: 'boolean', title: 'Reservation en ligne possible', group: 'policies', initialValue: false }),

    // === Copy ===
    defineField({ name: 'shortDesc', type: 'localizedText', title: 'Description courte', group: 'copy' }),
    defineField({ name: 'body', type: 'localizedPortableText', title: 'Description longue', group: 'copy' }),
    defineField({ name: 'goodToKnow', type: 'localizedText', title: 'Bon a savoir', group: 'copy' }),

    // === SEO ===
    defineField({ name: 'seo', type: 'seoMeta', title: 'SEO', group: 'seo' }),

    // === Meta (trace import LC, admin uniquement) ===
    defineField({
      name: 'lcHouseId',
      type: 'number',
      title: 'LC house ID',
      description: 'Identifiant unique de la villa cote Le Collectionist. Sert de cle de deduplication pour les re-imports.',
      group: 'meta',
      readOnly: true,
      validation: (r) =>
        r.integer().positive().custom(async (id, ctx) => {
          if (!id) return true;
          const client = ctx.getClient({ apiVersion: '2026-04-26' });
          const selfId = (ctx.document?._id ?? '').replace(/^drafts\./, '');
          const existing: string | null = await client.fetch(
            `*[_type == "villa" && lcHouseId == $id && !(_id in path("drafts.**")) && _id != $self][0]._id`,
            { id, self: selfId },
          );
          return existing ? `LC house ID ${id} deja utilise par une autre villa.` : true;
        }),
    }),
    defineField({ name: 'lcSlugFr', type: 'string', title: 'LC slug FR', group: 'meta', readOnly: true }),
    defineField({ name: 'lcSlugEn', type: 'string', title: 'LC slug EN', group: 'meta', readOnly: true }),
    defineField({ name: 'importedAt', type: 'datetime', title: 'Date import initial', group: 'meta', readOnly: true }),
    defineField({ name: 'lastSyncedAt', type: 'datetime', title: 'Date dernier sync', group: 'meta', readOnly: true }),
  ],
  preview: {
    select: { title: 'name', media: 'hero', subtitle: 'city' },
  },
  orderings: [
    { title: 'Ordre manuel', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Nom (A-Z)', name: 'name', by: [{ field: 'name', direction: 'asc' }] },
    { title: 'Prix croissant', name: 'priceAsc', by: [{ field: 'pricePerWeekFrom', direction: 'asc' }] },
  ],
});

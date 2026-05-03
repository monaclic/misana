// Objet hero reutilisable. Une seule image + un overlay editorial.
// Utilise par homePage, serviceHub, aboutPage, destinationPage, eventPage, etc.
import { defineType, defineField } from 'sanity';

export const pageHero = defineType({
  name: 'pageHero',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image (hero pleine largeur)',
      options: { hotspot: true },
    }),
    defineField({
      name: 'eyebrow',
      type: 'localizedString',
      title: 'Eyebrow (petite ligne au-dessus du titre, ex. "(MS · 01)")',
    }),
    defineField({
      name: 'title',
      type: 'localizedString',
      title: 'Titre H1',
    }),
    defineField({
      name: 'subtitle',
      type: 'localizedText',
      title: 'Sous-titre / lead',
    }),
    defineField({
      name: 'overlayDarkness',
      type: 'number',
      title: 'Opacite voile sombre (0 = pas de voile, 1 = noir total)',
      validation: (r) => r.min(0).max(1),
      initialValue: 0.45,
    }),
  ],
});

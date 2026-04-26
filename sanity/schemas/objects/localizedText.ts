import { defineType, defineField } from 'sanity';

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Localized text',
  type: 'object',
  fields: [
    defineField({ name: 'en', type: 'text', title: 'English', rows: 4 }),
    defineField({ name: 'fr', type: 'text', title: 'Français', rows: 4 }),
  ],
});

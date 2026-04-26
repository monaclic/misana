import { defineType, defineField } from 'sanity';

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized string',
  type: 'object',
  fields: [
    defineField({ name: 'en', type: 'string', title: 'English' }),
    defineField({ name: 'fr', type: 'string', title: 'Français' }),
  ],
});

import { defineType, defineField, defineArrayMember } from 'sanity';

const blockMember = defineArrayMember({
  type: 'block',
  styles: [
    { title: 'Body', value: 'normal' },
    { title: 'Heading 2', value: 'h2' },
    { title: 'Heading 3', value: 'h3' },
    { title: 'Quote', value: 'blockquote' },
  ],
  lists: [
    { title: 'Bullet', value: 'bullet' },
    { title: 'Numbered', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: 'Strong', value: 'strong' },
      { title: 'Emphasis', value: 'em' },
    ],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'Link',
        fields: [{ name: 'href', type: 'string' }],
      },
    ],
  },
});

export const localizedPortableText = defineType({
  name: 'localizedPortableText',
  title: 'Localized rich text',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      of: [blockMember],
    }),
    defineField({
      name: 'fr',
      title: 'Français',
      type: 'array',
      of: [blockMember],
    }),
  ],
});

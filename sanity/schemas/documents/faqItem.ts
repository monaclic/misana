import { defineType, defineField } from 'sanity';

export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ item',
  type: 'document',
  fields: [
    defineField({ name: 'questionEn', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'questionFr', type: 'string' }),
    defineField({
      name: 'answerEn',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'answerFr', type: 'array', of: [{ type: 'block' }] }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Chauffeur', value: 'chauffeur' },
          { title: 'Cars', value: 'cars' },
          { title: 'Yacht', value: 'yacht' },
          { title: 'Helicopter', value: 'helicopter' },
          { title: 'Access', value: 'access' },
          { title: 'Airport transfer', value: 'airport-transfer' },
          { title: 'Hourly', value: 'hourly' },
          { title: 'Daily', value: 'daily' },
          { title: 'Long distance', value: 'long-distance' },
          { title: 'Yacht-limo', value: 'yacht-limo' },
          { title: 'Day cruise', value: 'day-cruise' },
          { title: 'Week charter', value: 'week-charter' },
          { title: 'Transfer (helicopter)', value: 'helicopter-transfer' },
          { title: 'Scenic tour', value: 'scenic-tour' },
          { title: 'General', value: 'general' },
          { title: 'Payment', value: 'payment' },
          { title: 'Cancellation', value: 'cancellation' },
          { title: 'Privacy', value: 'privacy' },
        ],
      },
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Order (lower = higher in list)',
      initialValue: 0,
    }),
  ],
  preview: { select: { title: 'questionEn' } },
});

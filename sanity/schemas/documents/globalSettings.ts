// Reglages globaux du site. Singleton, lu partout (header, footer, contact).
// L'associee modifie ici une seule fois -> propage partout.
import { defineType, defineField } from 'sanity';

export const globalSettings = defineType({
  name: 'globalSettings',
  title: 'Reglages globaux',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Contact' },
    { name: 'social', title: 'Reseaux sociaux' },
  ],
  fields: [
    // --- CONTACT ---
    defineField({ name: 'contactPhone', type: 'string', group: 'contact',
      title: 'Telephone (format E.164 ou affichage libre)',
      description: 'Affiche dans header desktop, footer et page contact.',
    }),
    defineField({ name: 'contactPhoneHref', type: 'string', group: 'contact',
      title: 'Telephone href (tel:+33...)',
      description: 'Lien tel: utilise dans les balises a href.',
    }),
    defineField({ name: 'contactEmail', type: 'string', group: 'contact',
      title: 'Email',
      description: 'Affiche dans footer et page contact.',
    }),
    defineField({ name: 'whatsappNumber', type: 'string', group: 'contact',
      title: 'WhatsApp (format E.164, ex. +33600000000)',
    }),
    defineField({ name: 'address', type: 'localizedString', group: 'contact',
      title: 'Adresse postale (FR/EN)' }),

    // --- SOCIAL ---
    defineField({ name: 'instagram', type: 'url', group: 'social', title: 'Instagram (URL complete)' }),
    defineField({ name: 'linkedin', type: 'url', group: 'social', title: 'LinkedIn (URL complete)' }),
  ],
  preview: {
    prepare() { return { title: 'Reglages globaux' }; },
  },
});

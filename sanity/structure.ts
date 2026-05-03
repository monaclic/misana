// Structure builder Studio. On separe :
// - Pages editoriales (singletons : home, et plus tard about, hubs, etc.)
// - Catalogues (cars, yachts, etablissements, events, destinations...)
// - Reglages globaux
//
// Singletons = un seul doc, pas de "create new" pour eviter les doublons.
import type { StructureBuilder, StructureResolver } from 'sanity/structure';
import { SINGLETON_TYPES } from './schemas';

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Misana')
    .items([
      // === PAGES EDITORIALES ===
      S.listItem()
        .title('Pages')
        .child(
          S.list()
            .title('Pages editoriales')
            .items([
              S.listItem()
                .title('Page d\'accueil')
                .child(
                  S.editor()
                    .id('homePage')
                    .schemaType('homePage')
                    .documentId('homePage'),
                ),
            ]),
        ),

      S.divider(),

      // === CATALOGUES ===
      S.documentTypeListItem('rentalCar').title('Voitures (rental)'),
      S.documentTypeListItem('rentalCarCategory').title('Categories voiture'),
      S.documentTypeListItem('yacht').title('Yachts'),
      S.documentTypeListItem('accessEstablishment').title('Etablissements (Access)'),
      S.documentTypeListItem('helicopter').title('Helicopteres'),
      S.documentTypeListItem('heliport').title('Heliports'),
      S.documentTypeListItem('vehicle').title('Vehicules chauffeur'),
      S.documentTypeListItem('event').title('Events'),
      S.documentTypeListItem('curatedWeekend').title('Weekends'),
      S.documentTypeListItem('destination').title('Destinations'),
      S.documentTypeListItem('transferRoute').title('Transfer routes'),
      S.documentTypeListItem('route').title('Routes'),
      S.documentTypeListItem('service').title('Services'),
      S.documentTypeListItem('serviceVariant').title('Service variants'),
      S.documentTypeListItem('subService').title('Sub-services'),
      S.documentTypeListItem('journalPost').title('Journal'),
      S.documentTypeListItem('author').title('Auteurs'),
      S.documentTypeListItem('testimonial').title('Temoignages'),
      S.documentTypeListItem('faqItem').title('FAQ'),

      S.divider(),

      // === REGLAGES ===
      S.listItem()
        .title('Reglages globaux')
        .child(
          S.editor()
            .id('globalSettings')
            .schemaType('globalSettings')
            .documentId('globalSettings'),
        ),
    ]);

// Templates filtre : on cache "Create new" pour les singletons.
export function filterSingletonsFromActions(input: any[], context: any) {
  const { schemaType } = context;
  if (SINGLETON_TYPES.has(schemaType)) {
    return input.filter(({ action }) => !['unpublish', 'duplicate', 'delete'].includes(action || ''));
  }
  return input;
}

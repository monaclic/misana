import type { SchemaTypeDefinition } from 'sanity';
import { localizedString } from './objects/localizedString';
import { localizedText } from './objects/localizedText';
import { localizedPortableText } from './objects/localizedPortableText';
import { seoMeta } from './objects/seoMeta';
import { pageHero } from './objects/pageHero';
import {
  imageTextBlock,
  gridImagesBlock,
  quoteBlock,
  ctaBlock,
  factsBlock,
  linksBlock,
} from './objects/blocks';
import { service } from './documents/service';
import { serviceVariant } from './documents/serviceVariant';
import { subService } from './documents/subService';
import { destination } from './documents/destination';
import { event } from './documents/event';
import { curatedWeekend } from './documents/curatedWeekend';
import { transferRoute } from './documents/transferRoute';
import { route } from './documents/route';
import { accessEstablishment } from './documents/accessEstablishment';
import { vehicle } from './documents/vehicle';
import { rentalCar } from './documents/rentalCar';
import { rentalCarCategory } from './documents/rentalCarCategory';
import { yacht } from './documents/yacht';
import { helicopter } from './documents/helicopter';
import { heliport } from './documents/heliport';
import { faqItem } from './documents/faqItem';
import { testimonial } from './documents/testimonial';
import { journalPost } from './documents/journalPost';
import { author } from './documents/author';
import { globalSettings } from './documents/globalSettings';
import { homePage } from './documents/homePage';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Objets reutilisables
    localizedString,
    localizedText,
    localizedPortableText,
    seoMeta,
    pageHero,
    imageTextBlock,
    gridImagesBlock,
    quoteBlock,
    ctaBlock,
    factsBlock,
    linksBlock,
    // Documents
    service,
    serviceVariant,
    subService,
    destination,
    event,
    curatedWeekend,
    transferRoute,
    route,
    accessEstablishment,
    vehicle,
    rentalCar,
    rentalCarCategory,
    yacht,
    helicopter,
    heliport,
    faqItem,
    testimonial,
    journalPost,
    author,
    globalSettings,
    // Pages editoriales (singletons)
    homePage,
  ],
};

// Liste des `_type` qui sont des singletons (1 seul doc, pas de "create new").
export const SINGLETON_TYPES = new Set(['homePage', 'globalSettings']);

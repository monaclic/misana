import type { SchemaTypeDefinition } from 'sanity';
import { localizedString } from './objects/localizedString';
import { localizedText } from './objects/localizedText';
import { localizedPortableText } from './objects/localizedPortableText';
import { seoMeta } from './objects/seoMeta';
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
import { helicopter } from './documents/helicopter';
import { heliport } from './documents/heliport';
import { faqItem } from './documents/faqItem';
import { testimonial } from './documents/testimonial';
import { journalPost } from './documents/journalPost';
import { author } from './documents/author';
import { globalSettings } from './documents/globalSettings';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    localizedString,
    localizedText,
    localizedPortableText,
    seoMeta,
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
    helicopter,
    heliport,
    faqItem,
    testimonial,
    journalPost,
    author,
    globalSettings,
  ],
};

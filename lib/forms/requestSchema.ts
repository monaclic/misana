import { z } from 'zod';
import {
  SERVICES,
  DESTINATIONS,
  HELIPORT_IDS,
  CHAUFFEUR_SUBTYPES,
  CAR_TYPES,
  CAR_BRANDS,
  DRIVER_AGE_BRACKETS,
  YACHT_DURATIONS,
  YACHT_SIZES,
  OCCASIONS,
  ACCESS_CATEGORIES,
  REPLY_LANGS,
} from '~/types/request';

// Helpers
const optStr = (max = 200) => z.string().trim().max(max).optional().or(z.literal('')).transform((v) => v || undefined);
const optInt = (min = 0, max = 30) =>
  z.number().int().min(min).max(max).optional();

// Stepper groupes (chauffeur + helicopter)
export const passengersSchema = z.object({
  adults: optInt(0, 30),
  children: optInt(0, 20),
  babies: optInt(0, 10),
  pets: optInt(0, 10),
});
export type Passengers = z.infer<typeof passengersSchema>;

export const luggageSchema = z.object({
  cabin: optInt(0, 30),
  hold: optInt(0, 30),
  special: optInt(0, 10),
});
export type Luggage = z.infer<typeof luggageSchema>;

export const childSeatsSchema = z.object({
  infant: optInt(0, 10),
  child: optInt(0, 10),
  booster: optInt(0, 10),
});
export type ChildSeats = z.infer<typeof childSeatsSchema>;

// Sub-schemas par service
export const chauffeurSchema = z.object({
  // Mode : transfer (point à point) ou disposal (mise a disposition).
  // Distinct du subtype legacy. Source : query mode= sur /request.
  mode: z.enum(['transfer', 'disposal']).optional(),
  subtype: z.enum(CHAUFFEUR_SUBTYPES).default('one-way'),
  vehicleId: optStr(40),
  pickup: optStr(200),
  pickupPlaceId: optStr(120),
  dropoff: optStr(200),
  dropoffPlaceId: optStr(120),
  // Etapes intermediaires (aller et retour). Le scenario les capture en
  // array libre (max 5 par cote). Sans ces champs, les stops aller ne
  // remontaient que dans le free-text notes, et les stops retour etaient
  // completement perdus.
  stops: z.array(z.string().trim().max(200)).max(5).optional(),
  returnStops: z.array(z.string().trim().max(200)).max(5).optional(),
  // Ville de mise a disposition (mode=disposal uniquement).
  city: optStr(120),
  distanceKm: z.number().int().min(0).max(2000).optional(),
  date: optStr(20),
  time: optStr(10),
  hasReturn: z.boolean().optional(),
  returnDate: optStr(20),
  returnTime: optStr(10),
  // Le retour peut avoir des adresses et un nombre de passagers
  // differents de l'aller (groupe scinde, second pickup, etc.).
  // Le scenario ChauffeurTransferScenario les pre-remplit en swap des
  // adresses aller mais le client peut les editer.
  returnPickup: optStr(200),
  returnDropoff: optStr(200),
  returnPax: optInt(1, 30),
  flight: optStr(40),
  train: optStr(40),
  welcomeSign: optStr(80),
  durationHours: optInt(1, 24),
  passengers: passengersSchema.optional(),
  luggage: luggageSchema.optional(),
  childSeats: childSeatsSchema.optional(),
  // Tarif indicatif calcule cote client (matrice CHAUFFEUR_ROUTES si slug
  // de route connu, sinon priceForVehicleByKm). Pousse dans le payload
  // pour que l'equipe le voie dans l'email sans devoir recalculer.
  priceEstimate: z.number().int().min(0).max(100000).optional(),
  notes: optStr(2000),
});
export type ChauffeurDetails = z.infer<typeof chauffeurSchema>;

export const carsSchema = z.object({
  type: z.enum(CAR_TYPES).optional(),
  brand: z.enum(CAR_BRANDS).optional(),
  rentalCarId: optStr(60),
  pickup: optStr(200),
  startDate: optStr(20),
  endDate: optStr(20),
  driverAge: z.enum(DRIVER_AGE_BRACKETS).optional(),
  licenceCountry: optStr(60),
  notes: optStr(2000),
});
export type CarsDetails = z.infer<typeof carsSchema>;

export const yachtSchema = z.object({
  duration: z.enum(YACHT_DURATIONS).optional(),
  size: z.enum(YACHT_SIZES).optional(),
  yachtId: optStr(60),
  port: optStr(120),
  startDate: optStr(20),
  endDate: optStr(20),
  guests: optInt(1, 30),
  notes: optStr(2000),
});
export type YachtDetails = z.infer<typeof yachtSchema>;

export const helicopterSchema = z
  .object({
    departure: z.enum(HELIPORT_IDS as [string, ...string[]]).optional(),
    destination: z.enum(HELIPORT_IDS as [string, ...string[]]).optional(),
    date: optStr(20),
    time: optStr(10),
    hasReturn: z.boolean().optional(),
    returnDate: optStr(20),
    returnTime: optStr(10),
    helicopterId: optStr(40),
    passengers: passengersSchema.optional(),
    luggage: luggageSchema.optional(),
    // Tarif indicatif calcule cote client depuis la matrice des routes
    // helico. Pousse dans le payload pour visibilite equipe dans l'email.
    priceEstimate: z.number().int().min(0).max(100000).optional(),
    notes: optStr(2000),
  })
  .refine((v) => !(v.departure && v.destination && v.departure === v.destination), {
    message: 'Departure and destination must differ.',
    path: ['destination'],
  });
export type HelicopterDetails = z.infer<typeof helicopterSchema>;

export const accessItemSchema = z.object({
  category: z.enum(ACCESS_CATEGORIES).optional(),
  city: z.enum(DESTINATIONS).optional(),
  establishment: optStr(120),
  date: optStr(20),
  time: optStr(10),
  // Repas (restaurants uniquement). Prerempli depuis le widget fiche.
  meal: z.enum(['lunch', 'dinner']).optional(),
  guests: optInt(1, 30),
  occasion: z.enum(OCCASIONS).optional(),
});
export type AccessItem = z.infer<typeof accessItemSchema>;

export const accessSchema = z.object({
  items: z.array(accessItemSchema).max(8).default([]),
  notes: optStr(2000),
});
export type AccessDetails = z.infer<typeof accessSchema>;

// Contact
export const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  phone: optStr(40),
  phoneCode: optStr(10),
  preferredChannel: z.enum(['email', 'phone', 'whatsapp']).optional(),
  whatsapp: z.boolean().optional(),
  replyLang: z.enum(REPLY_LANGS).optional(),
  isOther: z.boolean().optional(),
  guestFirstName: optStr(80),
  guestLastName: optStr(80),
  guestPhone: optStr(40),
  message: optStr(2000),
});
export type Contact = z.infer<typeof contactSchema>;

export const billingSchema = z.object({
  enabled: z.boolean().optional(),
  company: optStr(120),
  vat: optStr(40),
  address: optStr(200),
  city: optStr(120),
  zip: optStr(20),
  country: optStr(80),
  email: optStr(200),
});
export type Billing = z.infer<typeof billingSchema>;

// Le payload du tronc /request.
// V1 : un seul service par demande (le multi-service represente moins de 10%
// des cas et complique trop le flux ; le client ajoute les autres dans le
// champ message libre, ou fait plusieurs demandes).
export const requestSchema = z
  .object({
    service: z.enum(SERVICES),
    destination: z.enum(DESTINATIONS).optional(),
    event: optStr(120),
    weekend: optStr(120),
    locale: z.enum(REPLY_LANGS).optional(),
    chauffeur: chauffeurSchema.optional(),
    cars: carsSchema.optional(),
    yacht: yachtSchema.optional(),
    helicopter: helicopterSchema.optional(),
    access: accessSchema.optional(),
    contact: contactSchema,
    billing: billingSchema.optional(),
    sourceUrl: optStr(500),
    honeypot: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.service === 'access') {
      if (!v.access || v.access.items.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['access', 'items'],
          message: 'Add at least one address.',
        });
      }
    }
    // Indicatif requis si un numero est fourni. Cote client on bloque
    // deja le submit mais on protege aussi le serveur (cas requete forgee
    // ou bypass JavaScript).
    if (v.contact.phone && !v.contact.phoneCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contact', 'phoneCode'],
        message: 'Phone country code is required when a number is provided.',
      });
    }
  });

export type RequestPayload = z.infer<typeof requestSchema>;

// Defaults helpers cote client (preremplissage URL avant zod parse)
export const emptyPassengers = (): Passengers => ({ adults: 1, children: 0, babies: 0, pets: 0 });
export const emptyLuggage = (): Luggage => ({ cabin: 0, hold: 0, special: 0 });
export const emptyChildSeats = (): ChildSeats => ({ infant: 0, child: 0, booster: 0 });
